const model_dmm = require('./model/model_dmm.js')
document.getElementById("btn_Parse").addEventListener("click", function () {
    function runParse() {
        model_dmm.test()
    }
    
    runParse()
})
// $("#btn_Parse").on("click", function () {
//     console.log('wahahagwadfsdew')
// })

// 頁面
// 1. 首頁 (模組: 最後匯入, 資料庫筆數, 搜尋影片介面(一律線上, 搜尋結果匯入離線資料庫), )

// 啟動流程
// 掃描現有影片列表中是否有增減

// 匯入流程
// 1. 讀取資料夾中影片
// 2. 影片取得詳細資料後, 比對影片資料庫中是否有此影片, 若無則寫入
// 3. 將影片搬至集中區域(需判斷檔案是否重複), 並下載封面
// 4. 寫入現有影片列表中
// 5. 頁面重新載入