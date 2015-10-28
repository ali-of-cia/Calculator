(function () {

'use strict';

var calButtons = document.getElementsByClassName("calButton");
var oldAns = 0;
var equation = "";
var prettyEquation = "";

/* Set initial value of result to 0 */
document.getElementById("result").innerHTML = 0;

for(var i = 0; i < calButtons.length; i++)
{
    calButtons[i].addEventListener('click', writeEquation, false);
    calButtons[i].myParam = calButtons[i].innerText;
}

function writeEquation (evt)
{
   /* Get the value of the object that was clicked */
   var newVal = evt.target.myParam;
   var prettyVal = newVal;
   var notNum = isNaN(newVal);
   var rf = document.getElementById("result-frame");

   if (newVal == "AC")
   {
       clear();
       rf.className = "mdl-cell mdl-cell--8-col suspended";
       return;
   }

   /* Add Class to highlight result window */
   rf.className = "mdl-cell mdl-cell--8-col inprogress";

   /* Change unicode and subscript characters of power and division */
   if (newVal == "\u00F7")
   {
       newVal = "\\";
       prettyVal = "\u00F7"
   }
   if (newVal == "xy")
   {
       newVal = "^";
       prettyVal = "^";
   }
    /* Make sure a number precedes an operator */
   if (equation === "" && notNum === true)
   {
      return;
   }

    /* Is this the first character entered? */
   if (equation === "" )
   {
      equation = newVal;
      prettyEquation = prettyVal;
      document.getElementById("result").innerHTML = equation;
      document.getElementById("history").innerHTML = "Ans = " + oldAns;
      return;
   }
   var lastVal = equation.slice(-1);
   var lastNotNum = isNaN(lastVal);

   /* You cannot have a decimal point after an operator */
   if ( newVal == "."  && lastNotNum === true)
   {
       return;
   }

   /* Don't allow divide by zero */
   if (newVal === "0" && lastVal == "/")
   {
       alert("You cannot divide by zero.");
       return;
   }
   if ( newVal === "=")
    {
       var postFix = inFixToPostFix();
       var result = calculate(postFix);
       document.getElementById("result").innerHTML = result;
       document.getElementById("history").innerHTML = prettyEquation;
       oldAns = result;
       equation = "";
       prettyEquation = "";
       rf.className = "mdl-cell mdl-cell--8-col suspended"
       return;
    }
   /* Format equation for number vs operator clicked */
   if (lastNotNum == notNum || (lastNotNum === false && newVal == ".") || (lastVal == "." && notNum === false ))
   {
      equation += newVal;
      prettyEquation += prettyVal;
   }
   else
   {
      equation += " " + newVal;
      prettyEquation += " " + prettyVal;
   }
   document.getElementById("result").innerHTML = prettyEquation;
}

function inFixToPostFix()
{
   /* Tokenize your expression */
   var expression = equation.split(" ");

   var postFixEquation = "";
   var operatorStack = [];

   /*Set the order of precendence for operators */
   var operators = {
            "^": {
                precedence:4,
                associativity: "Left"
            },
            "/": {
                precedence: 3,
                associativity: "Left"
            },
            "x": {
                precedence: 3,
                associativity: "Left"
            },
            "+": {
                precedence: 2,
                associativity: "Left"
            },
            "-": {
                precedence: 2,
                associativity: "Left"
            }
        };
    /* Use the shunting-yard algorithm to change to post fix notaton */
    for (var i = 0; i < expression.length; i++)
    {
        if (isNaN(expression[i]) === false)
        {
           postFixEquation += expression[i] + " ";
        }
        else
        {
           var op1 = expression[i];
           var op2 = operatorStack[operatorStack.length - 1];
           while("^/x+-".indexOf(op2) !== -1 && ((operators[op1].associativity   === "Left" && operators[op1].precedence <= operators[op2].precedence) || (operators[op1].associativity === "Right" && operators[op1].precedence < operators[op2].precedence)))
           {
                postFixEquation += operatorStack.pop() + " ";
                op2 = operatorStack[operatorStack.length - 1];
           }
            operatorStack.push(op1);
         }
    }
    while(operatorStack.length > 0)
    {
       postFixEquation += operatorStack.pop() + " ";
    }
    return postFixEquation;
}

function calculate(postFix)
{
  var result = [];
  postFix = postFix.split(" ");
  for (var i = 0; i < postFix.length -1; i++)
  {
      if (isNaN(postFix[i]) === false)
      {
          result.push(postFix[i]);
      }
      else
      {
         var a = result.pop();
         var b = result.pop();
         if(postFix[i] === "+")
         {
            result.push(parseFloat(a,10) + parseFloat(b,10));
         }
         else if(postFix[i] === "-")
         {
            result.push(parseFloat(b,10) - parseFloat(a,10));
         }
         else if(postFix[i] === "x")
         {
            result.push(parseFloat(a,10) * parseFloat(b,10));
         }
         else if(postFix[i] === "\\")
         {
            result.push(parseFloat(b,10) / parseFloat(a,10));
         }
         else if(postFix[i] == "^")
         {
            var total = 1;
            for(var i = 1; i <= a; i++)
            {
              total *= b;
            }
            result.push(total);
         }
      }
  }
  var res = result.pop();
  /* Band-aid for floating point precision error
  for more details check out http://floating-point-gui.de/errors/rounding/ */
  if (res % 1 === 0 )
  {
    return res;
  } else {
  return res.toFixed(2);
  }
}

function clear()
{
   equation = "";
   prettyEquation = "";
   document.getElementById("history").innerHTML = "Ans = " + oldAns;
   document.getElementById("result").innerHTML = 0;
}
})();