let quotes =[
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" }
]

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const ul=document.createElement("li");
quoteDisplay.appendChild("li")


function showRandomQuotes(){
    if(quotes.length===0){
        quoteDisplay.innerHTML="There are no quotes to show please add some";
        return;
    }
     const randomIndex = Math.floor(Math.random() * quotes.length);
     const quote = quotes[randomIndex];
     quoteDisplay.innerHTML = `"${quote.text}" — ${quote.category}`;
}
function createAddQuoteForm(){
    const textInput= document.getElementById("newQuoteText")
    const categoryInput=document.getElementById("newQuoteCategory");

    const newQuoteText = textInput.value.trim();
    const newQuoteCategory = categoryInput.value.trim();

    if(newQuoteText && newQuoteCategory){
        textInput.value="";
        categoryInput.value="";
        quotes.push({text:newQuoteText, category:newQuoteCategory});
        alert("Quote added successfully");
    }
    else{
        alert("Please enter category and quote!")
    }
}


newQuoteBtn.addEventListener("click", showRandomQuotes);
addQuoteBtn.addEventListener("click", createAddQuoteForm);
