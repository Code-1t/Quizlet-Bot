const webdriver = require('selenium-webdriver'); 
 const fs = require('fs'); 
 const { By } = webdriver; 
  
 require('chromedriver'); 
  
 const driver = new webdriver.Builder().forBrowser('chrome').build(); 
  
 const urls = { 
     login: 'https://quizlet.com/login', 
     matchGame: 'https://quizlet.com/734248278/match', 
     flashCards: 'https://quizlet.com/638494897/glosor-kap2b-en-el-aeropuerto-flash-cards/', 
     microMatchGame: 'https://quizlet.com/638494897/micromatch' 
 } 
  
 const { email, password } = require('./credentials'); 
  
 const xpaths = { 
     usernameInput: '//*[@id="username"]', 
     passwordInput: '//*[@id="password"]', 
     startBtn: '/html/body/div[6]/div/div/div/div[2]/button', 
     acceptCookiesBtn: '//*[@id="onetrust-accept-btn-handler"]' 
 } 
  
 const wordClassName = 'MatchModeQuestionGridTile'//'MatchModeQuestionScatterTile'; 
 const startBtnClassName = 'UIButton UIButton--hero'; 
 const flashCardsClassName = '.SetPageTerm-content'; 
  
 const login = async () => { 
    await driver.get(urls.login); 
    await driver.sleep(1000); 
  
    await (await driver.findElement(By.xpath(xpaths.usernameInput))).sendKeys(email); 
     
    const passwordInput = await driver.findElement(By.xpath(xpaths.passwordInput)); 
    await passwordInput.sendKeys(password); 
    await passwordInput.sendKeys(webdriver.Key.ENTER); 
 } 
  
 const playMatchGame = async () => { 
     await driver.get(urls.microMatchGame); 
  
     const flashCards = JSON.parse(fs.readFileSync('flash-cards.json'))[urls.flashCards]; 
     const cardMap = new Map(); 
  
     await (await driver.findElement(By.xpath(xpaths.acceptCookiesBtn))).click(); 
     await driver.sleep(2500); 
  
     await (await driver.findElement(By.className(startBtnClassName))).click(); 
  
     await driver.sleep(56); 
  
         let gameCards = await driver.findElements(By.className(wordClassName));  
      
         for(let i = 0; i < gameCards.length; i++) { 
             const  
             card = gameCards[i], 
             text = await card.getText(); 
      
             const otherCard = cardMap.get(text); 
      
             if(otherCard) { 
                 await card.click(); 
                 await otherCard.click(); 
                 continue; 
             } 
      
             cardMap.set(flashCards[text], card); 
         } 
    
 } 
  
 const saveFlashCards = async () => {   
     await driver.get(urls.flashCards); 
  
     const flashCards = {}; 
  
     let flashCardsEls = await driver.findElements(By.js(`return document.querySelectorAll('${flashCardsClassName}')`)); 
  
     for(let i = 0; i < flashCardsEls.length; i++) { 
         const flashCardEl = flashCardsEls[i]; 
  
         const { y } = await flashCardEl.getRect(); 
         const values = (await flashCardEl.getText()).split('\n'); 
         flashCards[values[0]] = values[1]; 
         flashCards[values[1]] = values[0]; 
  
         await driver.executeScript(`window.scrollTo(0, ${y-5})`); 
         await driver.sleep(500); 
  
         flashCardsEls = await driver.findElements(By.js(`return document.querySelectorAll('${flashCardsClassName}')`)); 
     } 
      
     fs.writeFileSync('flash-cards.json', JSON.stringify({ [urls.flashCards]: flashCards })); 
 } 
  
 const playMicroMatch = async () => { 
  
 } 
  
 const main = async () => { 
     await login(); 
     //await saveFlashCards(); 
     await driver.sleep(1000); 
     playMatchGame(); 
 } 
  
 main();
