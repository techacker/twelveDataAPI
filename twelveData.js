function twelveData() {
  
  const uri = 'https://api.twelvedata.com/quote?';
  const apiKey = 'YOUR API KEY';

  // Example URL Call - https://api.twelvedata.com/time_series?symbol=AAPL,MSFT,EUR/USD,SBUX,NKE&interval=1min&apikey=demo
  // Example URL Call - https://api.twelvedata.com/quote?symbol=AAPL,MSFT,EUR/USD,SBUX,NKE&apikey=demo
  
  // Create a new Google Sheet and rename it to 'Stocks'
  const stocksSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Stocks');
  const lr = stocksSheet.getLastRow();

  // Create another Google Sheet and rename it to 'TwelveData'
  const ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TwelveData');

  // Put the stocks you would like to get information on in this sheets Column 1, Row 2 onwards.
  const stocksRange = stocksSheet.getRange(2,1,lr-2,1).getValues();

  // Eliminate blank rows
  const tickers = stocksRange.filter(ticker => ticker[0] !== "");
  const requestedSymbols = tickers.join();
  
  // Compile the API call URL
  const urltoCall = uri + 'symbol=' + requestedSymbols + '&apikey=' + apiKey;

  const result = UrlFetchApp.fetch(urltoCall);
  const data = result.getContentText();
  const json = JSON.parse(data);

  let stockValues = [];

  // Collect the returned values in 'stockValues' array for easy replacement in Google Sheet.
  tickers.every(item => {
    let stockname = json[item].name;
    let fifty2high = json[item].fifty_two_week.high;
    let fifty2low = json[item].fifty_two_week.low;
    let open = json[item].open;
    let close = json[item].previous_close;
    let price = json[item].close;
    let volume = json[item].volume;
    stockValues.push([item, stockname, fifty2high, fifty2low, open, close, price, volume])
    return stockValues;
  })

  // Update the selected stocks values in 'TwelveData' sheet
  ss.getRange(2,1,stockValues.length, stockValues[0].length).setValues(stockValues);

  // In 'Stocks' sheet, you can use VLOOKUP from 'TwelveData' sheet to update corresponding values.

  // If your twelveData API plan doesn't support more than 8 calls per minute, then you might want to update your plan.
  // Mine only supported 8 so I had to modify my code a little bit to just pass 8 tickers in one call per min.
  // The above code will work for anyone with a better plan than FREE.. :)

  // Thank you!
}
