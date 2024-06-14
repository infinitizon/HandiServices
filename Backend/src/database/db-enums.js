class DBEnums {
   static get AuditLogStatus() {
      return [
         {code: 100, label: 'pending'}, 
         {code: 101, label: 'approved'},
         {code: 102, label: 'rejected'},
      ]
   }
   static get OrderStatus() {
      return [
         {code: 100, label: 'pending'}, 
         {code: 101, label: 'failed'},
         {code: 102, label: 'cancelled'},
         {code: 103, label: 'placed',},
         {code: 104, label: 'inprogress',},
         {code: 105, label: 'done'},
         {code: 106, label: 'completed'},
      ]
   }
   static get ProductType() {
      return [
         {code: 100, label: 'category',}, 
         {code: 101, label: 'sub_category',}, 
         {code: 102, label: 'product',}, 
         {code: 103, label: 'wallet',},
      ]
   }
   static get UserGender(){
      return [
         {code: 100, label: 'male'}, 
         {code: 101, label: 'female'},
         {code: 102, label: 'other'},
      ]
   }
   static get TxnStatus() {
      return [
         {code: 100, label: 'pending'}, 
         {code: 101, label: 'failed'},
         {code: 102, label: 'success'},
         {code: 103, label: 'reversed'},
         {code: 104, label: 'abandoned'},
         {code: 105, label: 'pending_approval'},
      ]
   }
   static get TxnHeaderType() {
      return [
         {code: 100, label: 'credit'}, 
         {code: 101, label: 'debit',},
      ]
   }
   static get NOKRelationships() {
      return [
         {code: 100, label: "Mother"},
         {code: 101, label: "Father"},
         {code: 102, label: "Husband"},
         {code: 103, label: "Wife"},
         {code: 104, label: "Son"},
         {code: 105, label: "Daughter"},
         {code: 106, label: "Brother"},
         {code: 107, label: "Sister"},
         {code: 108, label: "Parent"},
         {code: 109, label: "Friend"},
         {code: 110, label: "Partner"},
         {code: 111, label: "Manager"},
         {code: 112, label: "Others"},
      ]
   }
}

module.exports = DBEnums;