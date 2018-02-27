const model_dmm = require('./model/model_dmm.js')
document.getElementById("btn_Parse").addEventListener("click", runParse);
function runParse() {
    model_dmm.test()
}
// $("#btn_Parse").on("click", function () {
//     console.log('wahahagwadfsdew')
// })