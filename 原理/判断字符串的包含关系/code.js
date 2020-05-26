/**
* @methods 判断变量 str 是否在 str1、str2的合集里
* @param {String} str 需要判断的字符串
* @param {String} str1
* @param {String} str2
* @returns void 
**/
function isContainStr(str, str1, str2) {
    if (str == str1 || str == str2) {
        console.log(`存在包含字符串`);
    }
}