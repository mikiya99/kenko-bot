const puppeteer = require("puppeteer");
const { DateTime } = require("luxon");

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    protocolTimeout: 60000,
  });

  const page = await browser.newPage();
  // 以下の三行は自分で入力
  const username = "69216";
  const password = "69216TMbx";
  const location = "宮崎市";

  const targetUrl = "https://kenko:kenko-cac@ems4.kouku-dai.ac.jp/~take/kenko/";

  // ページ遷移
  await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 60000 });

  // ログインフォーム入力
  await page.type("#gno", username);
  await page.type("#pass", password);
  await page.click("#loginButton");

  // 新規入力ボタンが表示されるのを待機してクリック
  await page.waitForSelector("#k01Button", { visible: true });
  const inputButton = await page.$("#k01Button");
  await inputButton.evaluate(el => el.scrollIntoView());
  await inputButton.click();

  // JSTの日付を取得
  const jstDate = DateTime.now().setZone("Asia/Tokyo");
  const formattedDate = jstDate.toISODate();

  // 日付入力欄に今日の日付を入力（形式: yyyy-mm-dd）
  await page.evaluate((date) => {
    const dateInput = document.querySelector('#nichiji');
    if (dateInput) {
      dateInput.value = date;
      dateInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }, formattedDate);

  // ラジオボタンは click で選択
  await page.click('input[name="toi0"][value="1"]');

  // 体温
  const temp = (Math.floor(Math.random() * 5) + 2) / 10 + 36.0;
  const [intPart, decimalPart] = temp.toFixed(1).split(".");
  await page.evaluate((intPart, decimalPart) => {
    const temp1 = document.querySelector("#temp1");
    temp1.value = intPart;
    temp1.dispatchEvent(new Event("input", { bubbles: true }));

    const temp2 = document.querySelector("#temp2");
    temp2.value = decimalPart;
    temp2.dispatchEvent(new Event("input", { bubbles: true }));
  }, intPart, decimalPart);
  
  // 居住地
  await page.evaluate((location) => {
    const tf2 = document.querySelector("#tf2");
    tf2.value = location;
    tf2.dispatchEvent(new Event("input", { bubbles: true }));
  }, location);
  
  // 送信ボタンをクリック
  await page.click("#sendButton");
  await new Promise(r => setTimeout(r, 5000));

  console.log("✅ フォーム送信完了！");
  console.log(`📅 入力日付: ${formattedDate}`);
  console.log(`📋 入力体温: ${intPart}.${decimalPart}℃`);
  console.log(`🏠 入力居住地: ${location}`);
  
  await browser.close();
})();
