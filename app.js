//BUDGET CONTROLLER MODULE
var budgetController = (function () {

    var Expenses = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage=-1;
    }
    Expenses.prototype.calcPercentage=function(totalIncome){

        if(totalIncome>0){
        this.percentage=Math.round((this.value/totalIncome)*100);
        }else{
            this.percentage=-1;
        }
     };
     Expenses.prototype.getPercentage=function(){
        return this.percentage;
     }
    var Incomes = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value
    }

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (curr) {
            sum += curr.value;
        });
        data.total[type] = sum;
    }


    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    return {
        addItem: function (type, des, value) {

            var ID, newItem;

            //The last id +1 is the new id
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            if (type === 'exp') {
                newItem = new Expenses(ID, des, value);
            } else if (type === 'inc') {
                newItem = new Incomes(ID, des, value);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type,id){

            var ids,index;
            ids = data.allItems[type].map(function(current){
                return current.id; 
            });

            index=ids.indexOf(id);

            if(index!==-1){
                 data.allItems[type].splice(index,1);
            }


        },

        calculateBudget: function () {

            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.total.inc - data.total.exp;

            if (data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100)
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentage: function(){

            data.allItems.exp.forEach(function(curr){
                curr.calcPercentage(data.total.inc);
            })

        },
        getPercentages: function(){

            var allPercentages=data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            })
            return allPercentages;
        },

        getBudget: function () {

            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage
            };
        },

        test: function () {
            console.log(data);
        }
    }


})();


//UI CONTROLLER MODULE
var UIController = (function () {
    // Some Code
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetlabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel:'.item__percentage',
        dateLabel:'.budget__title--month'
    }
    var nodeListforEach=function(list,callback){
        for(var i=0;i<list.length;i++){
            callback(list[i],i)
        }
   }
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="fa fa-times-circle"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="fa fa-times-circle"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', this.formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID){
            var deleteElement=document.getElementById(selectorID);
            deleteElement.parentNode.removeChild(deleteElement);
        },

        clearField: function () {
            var fields, fieldArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + "," + DOMstrings.inputValue);
            fieldArr = Array.prototype.slice.call(fields);

            fieldArr.forEach(function (current, index, array) {
                current.value = "";
            });

        },

        displayBudget: function (obj) {

            obj.budget > 0 ? type='inc': type='exp';
            document.querySelector(DOMstrings.budgetlabel).textContent = this.formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = this.formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = this.formatNumber(obj.totalExp,'exp');


            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentage: function(percentages){

            var fields=document.querySelectorAll(DOMstrings.expensePercLabel);
            
            //query selector all returns a list we can either convert it to a array or else we can a function like we are making so that it loops over a list
           

            nodeListforEach(fields,function(current,index){

                if(percentages[index]>0){current.textContent=percentages[index]+'%';
            }else{
                current.textContent='---';
            }
                
            })            
        },
        displayMonth: function(){
  
        var now,year,month;
        now = new Date();
        months= ["January","February","March","April","May","June","July",
        "August","September","October","November","December"];

        year=now.getFullYear();
         month=now.getMonth();
        document.querySelector(DOMstrings.dateLabel).textContent=months[month]+','+year;
        },
        formatNumber: function(num,type){

            num = Math.abs(num);
            num = num.toFixed(2);
            var numSplit = num.split('.');
            var int=numSplit[0];
           if(int.length>3){
              int = int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
           }

            var dec= numSplit[1];
            type === 'exp'? sign = '-' : sign = '+';
            return sign+' '+int+'.'+dec;

        },

        changedType: function(){

            var fields = document.querySelectorAll(
                DOMstrings.inputType+","+
                DOMstrings.inputDescription+","+
                DOMstrings.inputValue
            )
            nodeListforEach(fields,function(curr){
                curr.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function () {
            return DOMstrings;
        }


    }

})();


//GLOBAL APP CONTROLLER MODULE
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.key === 'Enter' || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        //change events
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
    }

    var DOM = UICtrl.getDOMstrings();

    var updateBudget = function () {

        budgetCtrl.calculateBudget();

        var budget = budgetCtrl.getBudget()

        UICtrl.displayBudget(budget);
    
    }


    var updatePercentages =  function(){

        //1.calculate percentages
        budgetCtrl.calculatePercentage();
        //2.read percentages
        var percentages = budgetCtrl.getPercentages();
       //update UI
       UICtrl.displayPercentage(percentages);
    }
    var ctrlAddItem = function () {

        var input, newItem;
        //1. Get field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add List to UI
            UICtrl.addListItem(newItem, input.type);

            //4. Empty the fields
            UICtrl.clearField();

            //5.Update Budget
            updateBudget();

            updatePercentages();
        }

    }

    var ctrlDeleteItem = function(event){

       var itemId,splitID,type,ID;
       itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
       if(itemId){
           splitID = itemId.split('-');
           type=splitID[0];
           ID = parseInt(splitID[1]);

           //1. delete from ds
           budgetCtrl.deleteItem(type,ID);
           //2.delete from UI
           UICtrl.deleteListItem(itemId);

           //3.update the item
           updateBudget();

           updatePercentages();
       }

    };

    return {
        init: function () {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
           
        }
    }


})(budgetController, UIController);

controller.init();