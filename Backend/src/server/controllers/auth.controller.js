const Bcrypt = require('bcryptjs');

const { postgres, Sequelize } = require('../../database/models');

const AppError = require('../../config/apiError')
const CryptoJS = require('../utils/crypto')
const Helper = require('../utils/helper');
const {AuthService, UserService, NotificationService, CustomerWalletService } = require('../services');
const RateLimiter = require('../services/rate-limit.service');
const EmailService = require('../services/email-builder.service');
const genericRepo = require('../../repository');

class AuthController {
    static async login (req, res, next) {
        /**
         * #swagger.description = 'For user login. Any user can login
         * #swagger.parameters['obj'] = {
                in: 'body',
                description: 'Login a user to app',
                schema: {
                    $email: 'aa@bb.com',
                    $password: 'ebwK6AkFhktABmCwrDFRGg=='
                }
            }'
         */
        try {
            let { email, deviceToken, rememberMe } = req.body;
            let { success, message, line, file, status, show, user } = await (new AuthService).loginByEmail({ email })
            if (!success) throw new AppError(message||'Wrong email or password', line||__line, file||__path.basename(__filename), { status: status||404, show });
            user  = UserService.reformat(user);

            let response;
            if (user.dataValues.Tenant.length > 1) {
                user.dataValues.Tenant.forEach(tenant => {
                    delete tenant.dataValues.Roles
                });
                response = { multiTenant: true, user };
            } else {
                let signature = {
                    userId: user.id,
                    tenantId: user?.dataValues?.Tenant[0]?.id,
                };
                const token = await AuthService.createAccessToken({signature, ...(rememberMe && {expiresIn: '10d'})});
                if (!token.success) 
                    throw new AppError(token.message, token.line||__line, token.file||__path.basename(__filename), {name: token.name, status: token.status??401, show: token.show});
                
                const uuid = require('crypto').randomBytes(32).toString('hex');
                let uuidToken = await AuthService.createAccessToken({signature: { lastActive: (new Date).getTime(), ...(rememberMe && {rememberMe}), uuid }, expiresIn:(rememberMe?'10d':`${process.env.UUID_TOKEN_TIMEOUT}m`)});
                if (!uuidToken.success) 
                    throw new AppError(uuidToken.message, uuidToken.line||__line, uuidToken.file||__path.basename(__filename), {name: uuidToken.name, status: uuidToken.status??401, show: uuidToken.show});
                await user.update( { uuidToken: uuidToken.token }, );

    
                response = { ...token, xUUIDToken: uuid, multiTenant: false, user, };
            }

            delete user.dataValues.password
            delete user.dataValues.uuidToken
            await AuthController.deviceTokenManagement({deviceToken, user})
            res.status(200).json(response);
            // return next();
        } catch (error) {
           console.log(error.message);
           return next(
                   new AppError(
                       error.message
                       , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
            );
        }
    }
    static async logout (req, res, next) {
        /**
         * #swagger.description = 'This is to logout and destroy the token
         * #swagger.parameters['obj'] = {
                in: 'body',
                description: 'Logout and destroy the token',
                schema: {
                    $token: 'ebwK6AkFhktABmCwrDFRGg=='
                }
            }'
         */
        try {
            let auth = res.locals.user;
            const user = await postgres.models.User.findByPk(auth.userId);
            await user.update({ uuidToken: null })
            
            res.status(200).json({success: true, status: 200, message: `Logout successful`});
        } catch (error) {
           console.log(error.message);
           return next(
                   new AppError(
                       error.message
                       , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
            );
        }
    }

    static async forgotPassword (req, res, next) {
     /**
         * #swagger.description = 'Post for Forget Password'
         * #swagger.parameters['obj'] = {
                in: 'body',
                description: 'Generate OTP for Forget Password',
                required: true,
                type: 'object',
                schema: { 
                    email: {
                        type: 'string',
                        required: true
                    },
                }
         }
         * #swagger.responses[200] = {
                description: 'Password Reset Successful'
         } 
        * #swagger.responses[400] = {
                description: 'Email is required'
        }
        * #swagger.responses[404] = {
                description: 'Account not registered, please sign up'
        }
        * #swagger.responses[500] = {
                description: 'Server error'
        }
    */
        try {
          let { email } = req.body;
          if (!email) throw new AppError('Email required', __line, __path.basename(__filename), { status: 400, show: true });
          email = email.toLowerCase();
          const user = await postgres.models.User.findOne({ where: { email: { [Sequelize.Op.iLike]: email } }, });
          if (!user) throw new AppError('Account not registered, please sign up', __line, __path.basename(__filename), { status: 404, show: true });
          let otp = Helper.generateOTCode(6, false);
          const token = await postgres.models.Token.create({
            token: otp,
            userId: user.id,
          });
          if (!token) throw new AppError('Token error.', __line, __path.basename(__filename), { status: 512 });
      
          new EmailService({ recipient: user.email, sender: 'info@HandiServices.com', subject: 'Reset Your HandiServices Password' })
            .setCustomerDetails(user)
            .setEmailType({ type: 'change-password', meta: { customer: user, otp } })
            .execute();
      
          let resp = {
            code: 200,
            status: 'success',
            message: 'Password Reset Successful, We have sent an OTP to your registered email address.',
          };
          res.status(resp.code).json(resp);
          res.locals.resp = resp;
        } catch (error) {
          console.error(error.message);
          return next(
            new AppError(
              error.message
              , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
          );
        }
      }
    
      static async resetPassword (req, res, next) {
        /**
         * #swagger.description = 'Post for Reset Password'
         * #swagger.parameters['obj'] = {
                in: 'body',
                description: 'Reset Password',
                required: true,
                type: 'object',
            schema: {
                email: {
                    type: 'string',
                    required: true
                },
                password: {
                    type: 'string',
                    required: true
                },
                token: {
                    type: 'string',
                    required: true
                }
            }
        }
         * #swagger.responses[200] = {
                description: 'Password Reset Successful'
            }
         * #swagger.responses[400] = {
                description: 'Email, Password and Token required'
            }
         * #swagger.responses[403] = {
                description: 'Invalid or expired token'
            }
         * #swagger.responses[404] = {
                description: 'User does not exist.'
            }
         * #swagger.responses[500] = {
                description: 'Server error'
            }
        */
        try {
            let { email, password } = req.body;
            if (!email || !password) throw new AppError('Email and Password required', __line, __path.basename(__filename), { status: 400, show: true });
            password = (new CryptoJS({ aesKey: process.env.SECRET_KEY_AES, ivKey: process.env.SECRET_KEY_IV })).decryptWithKeyAndIV(password);
            email = email.toLowerCase();
            const user = await postgres.models.User.findOne({ where: { email: { [Sequelize.Op.iLike]: email } }, });
            if (!user) throw new AppError('User does not exist.', __line, __path.basename(__filename), { status: 404, show: true });
            const hashedPassword = Bcrypt.hashSync(password, 10);
            await user.update({ password: hashedPassword });
            let resp = {
                code: 200,
                status: 'success',
                message: 'Password Reset Successful',
            };
            res.status(resp.code).json(resp);
            res.locals.resp = resp;
        } catch (error) {
            console.error(error.message);
            return next(
                new AppError(
                    error.message
                    , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
            );
        }
    }

    static async changePassword  (req, res, next) {
        try {
            let { userId } = res.locals.user;
            let { oldPassword, newPassword } = req.body;
            oldPassword = (new CryptoJS({ aesKey: process.env.SECRET_KEY_AES, ivKey: process.env.SECRET_KEY_IV })).decryptWithKeyAndIV(oldPassword)
            newPassword = (new CryptoJS({ aesKey: process.env.SECRET_KEY_AES, ivKey: process.env.SECRET_KEY_IV })).decryptWithKeyAndIV(newPassword)
            if (oldPassword === newPassword)
                throw new AppError('New password cannot be the same as old!', __line, __path.basename(__filename), { status: 403, show: true });
            const user = await postgres.models.User.findByPk(userId);
            const correctPassword = Bcrypt.compareSync(oldPassword, user.password);
            if (!correctPassword) throw new AppError('Incorrect old password entered', __line, __path.basename(__filename), { status: 403, show: true });
            let hash = Bcrypt.hashSync(newPassword, 12);
            await postgres.models.User.update(
                { password: hash },
                { where: { id: userId } }
            );
            new EmailService({ sender: 'no-reply@handiservices.com', recipient: user.email, subject: 'Your password has been updated' })
                .setCustomerDetails(user)
                .setEmailType({ type: 'change_password_success', meta: user })
                .execute();
                
            let resp = { success: true, status: 200, message: 'Password changed successfully.', };
            res.status(resp.status).json(resp);
            res.locals.resp = resp;
        } catch (error) {
          console.error(error.message);
          return next(
            new AppError(
              error.message
              , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
          );
        }
    }

    static async loginChooseTenant (req, res, next) {
        /**
         * #swagger.description = 'To complete login for users with multiple tenants. Only one tenant is allowed'
         * #swagger.parameters['obj'] = {
                in: 'body',
                description: 'Login a user to app',
                schema: {
                    $userId: '3ccc8113-67be-47e8-a083-21b61800787b',
                    $tenantId: '248d7d93-c400-407a-ae6d-0eeae0727bd4',
                    $password: 'ebwK6AkFhktABmCwrDFRGg=='
                }
            }'
            #swagger.responses[200]= {
                description: 'User successfully signed up.',
                schema: {
                    token
                    multiTenant: false,
                    user
                }
            }
         */
        try {
            let { userId, tenantId, password } = req.body;
            password = (new CryptoJS({ aesKey: process.env.SECRET_KEY_AES, ivKey: process.env.SECRET_KEY_IV })).decryptWithKeyAndIV(password);
            let { success, user } = await (new AuthService).getUserAndTenant({ userId, tenantId })
            if (!success) throw new AppError('Wrong email or password', __line, __path.basename(__filename), { status: 404, show: true });

            let correctPassword = Bcrypt.compareSync(password, user.password);
            if (!correctPassword) {
                let address = req.connection.remoteAddress;
                let limitRes = await (new RateLimiter).consumeLimit(address);
                if (limitRes < 2) {
                new EmailService({ recipient: user.email, sender: 'info@HandiServices.com', subject: 'Unsuccessful Login Attempt' })
                    .setCustomerDetails(user)
                    .setEmailType({ type: 'login_failed', meta: user })
                    .execute();
                }
                throw new AppError(`Wrong email or password`, __line, __path.basename(__filename), { status: 400, show: true });
            }
            user = UserService.reformat(user);
            let signature = {
                userId: user.id,
                tenantId: user.dataValues.Tenant[0].id,
                jti: user.id,
            };
            const token = await AuthService.createAccessToken({signature});
            if (!token.success) 
                throw new AppError(token.message, token.line||__line, token.file||__path.basename(__filename), {name: token.name, status: token.status??500, show: token.show});

            delete user.dataValues.password
            res.status(200).json({ ...token, multiTenant: false, user, });
        } catch (error) {
            console.log(error.message);
            return next(
                new AppError(
                    error.message
                    , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
            );
        }
    }
    static async authenticate (req, res, next) {
        try {
            let auth = req.headers['authorization'];
            const xUUIDToken = req.headers['x-uuid-token'];
            let role = req.headers['role']
            if (!auth) throw new AppError('Please login to access the resource', __line, __path.basename(__filename), { status: 401, show: true });
            if (auth && auth.startsWith('Bearer ')) {
                auth = auth.slice('7', auth.length);
            }
            
            const authorized = await AuthService.verifyToken(auth, process.env.ACCESS_TOKEN_SECRET);
            if(!authorized.success) throw new AppError('Authentication invalid/Expired. Please login again', __line, __path.basename(__filename), { status: 401, show: true });
            
            const user = await postgres.models.User.findOne({
                attributes: ['id', 'uuidToken'],
                where: { id: authorized.data.userId },
            });
            if (!user) 
                throw new AppError('Account not registered, please sign up', __line, __path.basename(__filename), { status: 404, show: true});

            const UserUUIDToken = await AuthService.verifyToken(user.uuidToken);
            if (!UserUUIDToken || !UserUUIDToken.success) 
                throw new AppError(UserUUIDToken.message, UserUUIDToken.line||__line, UserUUIDToken.file||__path.basename(__filename), { status: UserUUIDToken.status||404, show: true});
            
            if (auth !== process.env.REPORTING_KEY && (!user.uuidToken || UserUUIDToken?.data.uuid !== xUUIDToken)) {
                throw new AppError('You are logged in on another device. Please log in again.', __line, __path.basename(__filename), { status: 401, show: true });
            }
            
            console.log(new Date().getTime() - UserUUIDToken?.data?.lastActive, (new Date().getTime() - UserUUIDToken?.data?.lastActive) / 1000 / 60)
            if(UserUUIDToken?.data?.rememberMe) {
                if(((new Date().getTime() - UserUUIDToken?.data?.lastActive) /1000/60/60/24/10) > process.env.UUID_TOKEN_TIMEOUT) //User has been active for more than 10days
                    throw new AppError('Session timeout. Please login again', __line, __path.basename(__filename), { status: 401, show: true });

            } else {
                if(((new Date().getTime() - UserUUIDToken?.data?.lastActive) / 1000 / 60) > process.env.UUID_TOKEN_TIMEOUT) //User has been inactive for 15mins
                    throw new AppError('Session timeout. Please login again', __line, __path.basename(__filename), { status: 401, show: true });

                let uuidToken = await AuthService.createAccessToken({signature: { lastActive: (new Date).getTime(), uuid: UserUUIDToken?.data?.uuid }, expiresIn: `${process.env.UUID_TOKEN_TIMEOUT}m`});
                await user.update( { uuidToken: uuidToken.token }, );
            }
        
            res.locals.user = {role, ...authorized.data};

            next();
        } catch (error) {
            console.log(error.message);
            return next(
                new AppError(
                    error.message
                    , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
            );
        }
    }
    static authorize(roles=[]) {
        if(!Array.isArray(roles) || roles.length <= 0) throw new AppError(`Please specify role(s) for user`, __line, __path.basename(__filename), { status: 401, show: true });
        if(roles.length === 1 && roles.includes('*')){
            roles = ['PROVIDER_ADMIN', 'SUPER_ADMIN', 'PROVIDER', 'CUSTOMER']
        }
        return async (req, res, next) => {
            try {
                let { userId, tenantId, role } = res.locals.user
                let { success, user } = await (new AuthService).getUserAndTenant({ userId, tenantId })
                if (!success) throw new AppError('Wrong email or password', __line, __path.basename(__filename), { status: 404, show: true });
                user = UserService.reformat(user);
                if(role){
                    if(!roles.includes(role))throw new AppError(`Permission not granted for role(s)`, __line, __path.basename(__filename), { status: 401, show: true });
                    next()
                } else {
                    if (!user.dataValues.Tenant[0].dataValues.Roles.some(e => roles.includes(e.name))) 
                        throw new AppError(`Permission not granted for role(s)`, __line, __path.basename(__filename), { status: 401, show: true });
                    else{ 
                        if(!res.locals.user?.role){
                            res.locals.user = {...res.locals.user, role: user.dataValues.Tenant[0].dataValues.Roles[0].dataValues.name}
                        }
                        next()
                    }
                }
            } catch (error) {
                console.log(error.message);
                return next(
                    new AppError(
                        error.message
                        , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
                );
            }
        }
    }
    static async signup (req, res, next) {
        /**
         * #swagger.description = 'To verify BVN with DoB'
         * #swagger.parameters['obj'] = {
                in: 'body',
                description: 'Enter BVN and DoB',
                schema: {
                    $bvn: '22211124253',
                    $password: 'ebwK6AkFhktABmCwrDFRGg==',
                    $dob: '22-10-1990',
                    $firstName: 'John',
                    $lastName: 'Doe',
                    $middleName: '',
                    $email: 'john@doe.com',
                    $address: 'North pole, Angletterre, Nicaragua',
                    $gender: 'male|female',
                    $phone: '08123456789',
                    $placeOfBirth: 'Northern Hemisphere',
                    $mothersMaidenName: 'Mother',
                }
            }'
            #swagger.responses[200]= {
                description: 'User successfully signed up.',
                schema: {
                    multiTenant: false,
                    user
                }
            }
         */
        const t = await postgres.transaction()
        try {
            let post = req.body;
            // post.dob = moment(post.dob).format('YYYY-MM-DD');
            if(post.password)
                post.password = (new CryptoJS({ aesKey: process.env.SECRET_KEY_AES, ivKey: process.env.SECRET_KEY_IV })).decryptWithKeyAndIV(post.password);
            // post.gender = post.gender.toLowerCase();
            // if (post.gender.charAt(0) === 'm') post.gender = 'male';
            // else if (post.gender.charAt(0) === 'f') post.gender = 'female';
            // else post.gender = 'other';

            const userService = new UserService;
            const { data: roles, ...roleInfo } = await UserService.getRoles({roleName: 'CUSTOMER'});
            if (!roleInfo || !roleInfo.success || roles.length <=0) 
                throw new AppError(roleInfo.show?roleInfo.message:'Error occured while setting role. Please try again later', roleInfo.line||__line, roleInfo.file||__path.basename(__filename), { status: roleInfo.status||403, show: roleInfo.show });

            const tenant = {id: '77fa1eed-bbc8-4ae7-9237-0bec880b513d'}; // Hardcoding to the SuperAdmin tenant
            
            let { success, data: user, message, ...error } = await userService.createUser({ user: post, tenant, role: roles[0], sendOTP: true, transaction: t })
            if (!success) throw new AppError(error.show?message:'Error creating user. Please try again later', __line, __path.basename(__filename), { status: 403, show: error.show });

            await t.commit();
            res.status(200).json({ multiTenant: false, user, });
            
        } catch (error) {
            await t.rollback();
            console.log(error.message);
            return next(
                new AppError(
                    error.message
                    , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
            );
        }
    }
    static async generateOTP (req, res, next) {
        /**
         * #swagger.description = 'To generate OTP for user verification'
         * #swagger.parameters['obj'] = {
                in: 'body',
                description: 'Generate OTP for user verification',
                required: true,
                type: 'object',
                schema: { 
                    email: {
                        type: 'string',
                        required: true
                    },
                    subject: {
                        type: 'string',
                    },
                    message: {
                        type: 'string'
                    }
                }
         }
         * #swagger.responses[201] = {
                description: 'OTP generated successfully'
         } 
        * #swagger.responses[400] = {
                description: 'Email is required'
        }
        * #swagger.responses[404] = {
                description: 'Account not registered, please sign up'
        }
        * #swagger.responses[500] = {
                description: 'Server error'
        }
         */
        try {
            let { user, otp, subject, message } = req.body;
            new EmailService({ recipient: user.email, sender: 'info@handiservices.com', subject: subject ? subject : 'One Time Password' })
                .setCustomerDetails(user)
                .setEmailType({ type: 'resend_otp', meta: { user, otp, message } })
                .execute();

         const response = { success: true, status: 200, data: {expiresIn: process.env.OTP_EXPIRY }, message: 'OTP generated successfully'};
          res.status(response.status).send(response)
        } catch (error) {
            console.error(error.message);
            return next(
                new AppError(
                    error.message
                    , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
            );
        }
    }
    static async verifyOTP (req, res, next) {
        /**
         * #swagger.description = 'To Verify OTP'
         * #swagger.parameters['obj'] = {
                in: 'body',
                description: 'Verify OTP',
                required: true,
                type: 'object',
                schema: { 
                    email: {
                        type: 'string',
                        required: true
                    },
                    token: {
                        type: 'string',
                        required: 'true'
                    }
                 }
         }
         * #swagger.responses[200] = {
                description: 'OTP verified successfully'
         } 
        * #swagger.responses[400] = {
                description: 'Email and Token required'
        }
        * #swagger.responses[403] = {
                description: 'Invalid or expired token'
        }
        * #swagger.responses[404] = {
                description: 'User does not exist.'
        }
        * #swagger.responses[500] = {
                description: 'Server error'
        }
         */
        try {
            let resp = {
                success: true,
                code: 200,
                message: 'OTP verified successfully',
            };
            res.status(resp.code).json(resp);
            res.locals.resp = resp;
        } catch (error) {
            console.error(error.message);
            return next(
                new AppError(
                error.message
                , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
            );
        }
    }

    static async completeSignup (req, res, next) {
        /**
         * #swagger.description = 'To complete user signup'
         * #swagger.parameters['obj'] = {
                in: 'body',
                description: 'Verify OTP',
                required: true,
                type: 'object',
                schema: { 
                    email: {
                        type: 'string',
                        required: true
                    },
                    token: {
                        type: 'string',
                        required: 'true'
                    }
                 }
         }
         * #swagger.responses[200] = {
                description: 'OTP verified successfully'
         } 
        * #swagger.responses[400] = {
                description: 'Email and Token required'
        }
        * #swagger.responses[403] = {
                description: 'Invalid or expired token'
        }
        * #swagger.responses[404] = {
                description: 'User does not exist.'
        }
        * #swagger.responses[500] = {
                description: 'Server error'
        }
         */
        const t = await postgres.transaction()
        let { email, password } = req.body;
        try {
            let user = await genericRepo.setOptions('User', {
                condition: { email: { [Sequelize.Op.iLike]: email } },
            }).findOne();
            if(password) {
                password = (new CryptoJS({ aesKey: process.env.SECRET_KEY_AES, ivKey: process.env.SECRET_KEY_IV })).decryptWithKeyAndIV(password);
                const userService = new UserService();
                const updateUser = await userService.updateProfile({userId: user.id, changes: {password, isEnabled: true, isLocked: false}, transaction: t});
                if (!updateUser || !updateUser.success)
                    throw new AppError(
                        updateUser.show?updateUser.message:'Error completing registration. Please perform a password reset or contact admin', 
                        __line, __path.basename(__filename), { status: 400, show: updateUser.show });
            }
            const walletService = new CustomerWalletService;
            await walletService.createWallet({userId: user.id, transaction: t})

            await t.commit()
            let resp = {
                success: true,
                code: 200,
                message: 'User signup complete.'
            };
            res.status(resp.code).json(resp);
            res.locals.resp = resp;
        } catch (error) {
          console.error(error.message);
          await t.rollback();
          return next(
            new AppError(
              error.message
              , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
          );
        }
    }

    static async deviceTokenManagement ({deviceToken, user}) {
        if(deviceToken){
            //register device to PO-TOPIC
            //=> find if more than one user has the same userToken
            const usersToken = await genericRepo.setOptions('User', {
                condition: {deviceToken}
            }).findAll()
            if(usersToken.length > 0){
                await genericRepo.setOptions('User', {
                    condition: {deviceToken},
                    changes: {deviceToken: null}
                }).update()
            }
                await genericRepo.setOptions('User', {
                    condition: {id: user.id},
                    changes: {deviceToken}
                }).update()
            
            await NotificationService.subscribeToTopic({deviceToken, topic: process.env.NOTIFICATIONS_CHANNEL})
        }
        return;
    }
}

module.exports = AuthController;
