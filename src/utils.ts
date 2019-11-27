var fs = require('fs');
var path = require("path");

export class utils {

    fileList: any

    otherFileList: any

    folderList: any

    _filesName: string = "ExportJson"

    constructor() {
    }

    //查找文件夹和文件
    scanFolder(dir: any, filesName: any, skip_suffixes: any, skip_fixed_strings: any, searchSubfolder: any): any {

        this.fileList = [],
            this.otherFileList = [],
            this.folderList = [],
            this._filesName = filesName || "ExportJson",

            this.walk(dir, skip_suffixes, skip_fixed_strings, searchSubfolder);

        return {
            'files': this.fileList,
            'otherFileList': this.otherFileList,
            'folders': this.folderList
        }
    };

    walk(dir: any, skip_suffixes: any, skip_fixed_strings: any, searchSubfolder: any): void {

        var self = this;
        var files = fs.readdirSync(dir);
        files.forEach(function (item: any) {
            var tmpPath = dir + '/' + item,
                stats = fs.statSync(tmpPath);
            var skip = false;
            if (skip_fixed_strings) {
                for (var i = 0; i < skip_fixed_strings.length; i++) {
                    if (tmpPath.indexOf(skip_fixed_strings[i]) >= 0) {
                        skip = true;
                        break;
                    }
                }
            }
            if (!skip) {
                if (stats.isDirectory()) {
                    if ((typeof (searchSubfolder) == "undefined" || searchSubfolder)) {
                        self.walk(tmpPath, self.fileList, self.otherFileList, self.folderList);
                    }
                    self.folderList.push(tmpPath);
                } else {

                    var extend = tmpPath.substring(tmpPath.lastIndexOf(".") + 1);
                    if (extend == self._filesName) {
                        self.fileList.push(tmpPath);
                    } else {
                        if (skip_suffixes && skip_suffixes.indexOf(extend) >= 0) {

                        } else {
                            self.otherFileList.push(tmpPath);
                        }
                    }
                }
            }
        });
    }

    existsSync(filePath: any): any {
        return fs.existsSync(filePath);
    }

    deleteall(dir: any): void {
        var files = [];
        if (fs.existsSync(dir)) {
            files = fs.readdirSync(dir);
            var self = this;
            files.forEach(function (file: any, index: any) {
                var curPath = dir + "/" + file;
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    self.deleteall(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(dir);
        }
    };

    createDirsSync(dir: string, split: string = "/"): void {
        if (!fs.existsSync(dir)) {
            var dirArr = dir.split(split);
            var pathtmp;
            for (var i = 0; i < dirArr.length; i++) {
                var item = dirArr[i];
                if (item == "")
                    continue;
                if (pathtmp) {
                    pathtmp = path.join(pathtmp, item);
                }
                else {
                    pathtmp = item;
                }
                if (!fs.existsSync(pathtmp)) {
                    fs.mkdirSync(pathtmp)
                }
            }
        }
    };

    writeFileSync(dir: any, name: any, data: any): void {
        this.createDirsSync(dir, "/");
        if (data) {
            fs.writeFileSync(dir + "/" + name, data);
        }
    };

    urlencode(str: any): any {
        str = (str + '').toString();
        return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
            replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
    };
}
