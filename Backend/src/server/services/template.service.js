const xlsx = require("xlsx")

class TemplateService{
    constructor({templateName}){
        const workbook = xlsx.utils.book_new();
        this.templateName = templateName;
        this.workbook = workbook;
        return this;
    }
    generate = async (data) => {
        let sheet;
        switch (this.templateName) {
            case 'bulkTransaction':{
                const jsonObject = this.generateUserObject(data)
                sheet = xlsx.utils.json_to_sheet(jsonObject);
            }
            case 'agents': {
                const jsonObject = [{
                    name: "",
                    email: "",
                    phone: "",
                }]
                sheet = xlsx.utils.json_to_sheet(jsonObject);
            }
            default:
             // code block
        }
        xlsx.utils.book_append_sheet(this.workbook, sheet, `${this.templateName} Template`);
        let result = xlsx.write(this.workbook, {
            type: "buffer",
            bookType: "xlsx",
            bookSST: false,
        });
        return result
    } 
    generateUserObject = async (data) => {
        let arr = [];
        if(data.length < 1){
          arr.push({
            "FIRST NAME": '',
            "MIDDLE NAME": '',
            "LAST NAME": '',
            EMAIL: '',
            USER_ID: '',
            AMOUNT: "",
            ASSET: "",
            DESCRIPTION: "",
            CURRENCY: "",
          });
        }else{
          for (let item of data) {
            arr.push({
              "FIRST NAME": item.User.dataValues.first_name,
              "MIDDLE NAME": item.User.dataValues.middle_name,
              "LAST NAME": item.User.dataValues.last_name,
              EMAIL: item.User.email,
              USER_ID: item.User.id,
              AMOUNT: "",
              ASSET: "",
              DESCRIPTION: "",
              CURRENCY: "",
            });
          }
        }
        return arr;
    };
}

module.exports = TemplateService