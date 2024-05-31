const Flexible = require('rate-limiter-flexible');

class RateLimiter {
   constructor() {
      let config = {
         points: 3,
         duration: 10,
         blockDuration: 60
      }
      this.rateLimiter = new Flexible.RateLimiterMemory(config);
   }
   async getLimitStatus (address) {
      try {
          const res = await this.rateLimiter.get(address);
          if(!res) return;
          if(res.remainingPoints <= 0) {
              let timeoutRemainder = res.msBeforeNext/1000/60;
              return Math.floor(timeoutRemainder);
          }
          else return 'valid';
      } catch (error) {
         // Logger.error(error);
          return;
      }
   }
   async consumeLimit (address) {
      try {
          const res = await this.rateLimiter.consume(address);
          if(!res) return;
          return res.remainingPoints;
      } catch (error) {
         // Logger.error(error);
          return;
      }
  }
}

module.exports = RateLimiter;