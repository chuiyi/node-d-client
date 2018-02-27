var fs = require('fs')
var http = require('http')
var path = require('path')
var request = require('request')
// var strAV = '\\\\DISKSTATION\\Temp\\Incoming\\AV'
var strAV = '\\\\DISKSTATION\\Temp\\AV\\騎兵'
var strAVTooLong = '\\\\DISKSTATION\\Temp\\Incoming\\AV\\太長了'
var strPath = '\\\\DISKSTATION\\Temp\\Incoming\\test'
var EXTENSION = ['.mp4', '.avi', '.mkv', '.wmv']

exports.test = function () {
    if (!fs.existsSync(strPath)) {
        fs.mkdirSync(strPath);
    }
    walk(strPath, function (err, files) {
        if (err) {
        }
        var targetFiles = []
        EXTENSION.forEach(function (ext) {
            targetFiles = targetFiles.concat(files.filter(function (file) {
                return path.extname(file).toLowerCase() === ext
            }));
        })
        console.log('開始處理' + targetFiles.length + '支影片')

        var countTargetFiles = 0
        targetFiles.forEach(function (filePath) {
            var fileName = path.basename(filePath)

            var number = fileName.substring(0, fileName.length - path.extname(filePath).length).match(/[a-zA-Z]+|[0-9]+/g)
            var querystring = (number && number.length >= 2) ? (number[number.length - 2].toLowerCase() + getNumberWithDigit(parseInt(number[number.length - 1]), 5)) : '我甚麼都不知道'
            var realQuerystring = (number && number.length >= 2) ? (number[number.length - 2].toLowerCase() + ' ' + getNumberWithDigit(parseInt(number[number.length - 1]), 3)) : '我甚麼都不知道'
            request({
                url: 'https://node-d-heroku.herokuapp.com/api/dmm/query?q=' + realQuerystring,
                method: "GET"
            }, function (e, r, b) {
                if (!e) {
                    var json = []
                    if (b.length != 0) {
                        json = JSON.parse(b)
                        var isParse = false
                        if (json.length === 1) {
                            json = json[0]
                            var aNumber = json.cid.match(/[a-zA-Z]+|[0-9]+/g)
                            var aQuerystring = (aNumber && aNumber.length >= 2) ? (aNumber[aNumber.length - 2].toLowerCase() + getNumberWithDigit(parseInt(aNumber[aNumber.length - 1]), 5)) : ''
                            if (aQuerystring === querystring) {
                                isParse = true
                            }
                        }
                        else if (json.length > 1) {
                            json.forEach(function (obj) {
                                var aNumber = obj.cid.match(/[a-zA-Z]+|[0-9]+/g)
                                var aQuerystring = (aNumber && aNumber.length >= 2) ? (aNumber[aNumber.length - 2].toLowerCase() + getNumberWithDigit(parseInt(aNumber[aNumber.length - 1]), 5)) : ''
                                if (aQuerystring === querystring) {
                                    isParse = true
                                    json = obj
                                }
                            })
                        }
                        else {
                            console.log('失敗(找不到喔): ' + realQuerystring)
                        }

                        if (isParse) {
                            request({
                                url: 'https://node-d-heroku.herokuapp.com/api/dmm/video?url=' + json.url,
                                method: "GET"
                            }, function (err2, r2, result2) {
                                // 寫圖檔
                                jsonfile = JSON.parse(result2)

                                var strPathPrefix = strAV
                                if (!fs.existsSync(strPathPrefix)) {
                                    fs.mkdirSync(strPathPrefix)
                                }
                                if (jsonfile.makers.length === 1) {
                                    strPathPrefix = strPathPrefix + '\\' + '[' + jsonfile.makers[0].name + ']'
                                    strPathPrefix = replaceInvalidWord(strPathPrefix)
                                    if (!fs.existsSync(strPathPrefix)) {
                                        fs.mkdirSync(strPathPrefix)
                                    }
                                }
                                if (jsonfile.actresses.length === 1) {
                                    strPathPrefix = strPathPrefix + '\\' + jsonfile.actresses[0].name
                                    strPathPrefix = replaceInvalidWord(strPathPrefix)
                                    if (!fs.existsSync(strPathPrefix)) {
                                        fs.mkdirSync(strPathPrefix)
                                    }
                                }
                                try {
                                    fs.renameSync(filePath, strPathPrefix + '\\' + replaceInvalidWord(jsonfile.filename) + path.extname(filePath))
                                    console.log('成功: ' + jsonfile.filename)
                                }
                                catch(err) {
                                    fs.renameSync(filePath, strAVTooLong + '\\' + jsonfile.number + path.extname(filePath))
                                    console.log('失敗(檔名過長): ' + jsonfile.filename)
                                }
                                // deleteFolderRecursive(path.dirname(filePath))
                                var fileImg = fs.createWriteStream(strPathPrefix + '\\' + replaceInvalidWord(jsonfile.filename) + '.jpg')
                                http.get(jsonfile.img_cover, function (response) {
                                    response.pipe(fileImg)
                                })
                            })
                        }
                    }
                }
            });
        })
    })
}

function replaceInvalidWord(str) {
    if (str) return str.replace(/[\/*?]/g, "_");
    else return ""
}

function walk(dir, done) {
    var results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = dir + '/' + file;
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
};

function getNumberWithDigit(number, digit) {
    var result = String(number);
    while (result.length < digit) {
        result = '0' + result;
    }
    return result;
}

var deleteFolderRecursive = function (path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};