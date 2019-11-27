
import fs = require('fs');
import ISample = require('./isample');
import { compress } from './compress';

export class common {

    _data: any

    private _jsFiles: string[] = [];

    private _commonJsArr: string[] = [];

    private arrFileInfo: ISample.IFilesInfo[] = [];

    constructor(data: any, compress: compress) {

        this._data = data;

        this.getAllJSFiles();

        console.log("开始压缩" + data.name + "模块");

        compress.starCompress(this.arrFileInfo, data);

        console.log("压缩" + data.name + "成功");
    }

    getAllJSFiles(): void {

        this._commonJsArr = this._data.commonJsArr.slice();

        this.getAllCommonFile();

        this.mergeCommonJsArr();

        this.setLanguageFilesInfo();

        this.clearNoSeedFile();
    }

    // 获取所有的common所需要的的js文件
    getAllCommonFile(): void {

        this.findJSFileByPath(this._data.path + "common", true, "common");

        this.findJSFileByPath(this._data.path + "lib");

        this.findJSFileByPath(this._data.path.substring(0, this._data.path.length - 1), false);
    }

    findJSFileByPath(rootPath: string, isRecursion: boolean = true, fileName: string = ""): void {

        var self = this;

        var files = fs.readdirSync(rootPath);

        files.forEach(function (item, index) {
            var fPath = rootPath + "/" + item;

            var stat = fs.statSync(fPath);

            if (stat.isDirectory() === true && isRecursion) {
                self.findJSFileByPath(fPath);
            }

            if (!stat.isFile() || !self.isJsFile(fPath)) {
                return;
            }

            var isin = fPath.indexOf("resource_");

            if (isin != -1 && fileName == "common")
                return;

            self._jsFiles.push(fPath);
        });
    }

    isJsFile(path: string): boolean {

        var str_length = path.length;
        var sub_str = path.substr(str_length - 3, str_length);
        if (sub_str == ".js") {
            return true;
        }

        return false;
    }

    // 合并两个数组
    mergeCommonJsArr(): void {

        for (var nCommonJsIndex = 0; nCommonJsIndex < this._commonJsArr.length; ++nCommonJsIndex) {

            var commonJsName = this._commonJsArr[nCommonJsIndex];

            this._commonJsArr[nCommonJsIndex] = this._data.path.replace("src/", "") + commonJsName;

            for (var nFilesIndex = 0; nFilesIndex < this._jsFiles.length; ++nFilesIndex) {

                var fileName = this._jsFiles[nFilesIndex];

                var isin = fileName.indexOf(commonJsName);

                if (isin == -1) {
                    continue;
                }

                this._jsFiles.splice(nFilesIndex, 1);

                --nFilesIndex;
            }
        }

        this._commonJsArr = this._commonJsArr.concat(this._jsFiles);
    }

    setLanguageFilesInfo(): void {

        this.arrFileInfo = [];

        for (let nlanIndex: number = 0; nlanIndex < this._data.language.length; ++nlanIndex) {

            var curLan: string = this._data.language[nlanIndex];

            let tagInfo: ISample.IFilesInfo = {
                files: this._commonJsArr.slice(),
                path: ""
            }

            for (let nIndex: number = 0; nIndex < tagInfo.files.length; ++nIndex) {

                var isin = tagInfo.files[nIndex].indexOf("common/resource.js")

                if (isin == -1)
                    continue

                if (curLan != "zh") {
                    tagInfo.files[nIndex] = this._data.path + "common/resource_" + curLan + ".js";
                }

                tagInfo.path = this._data.outDir + "common_" + curLan + "/";

                break;
            }

            this.arrFileInfo.push(tagInfo);
        }
    }

    // 清除不需要的文件
    clearNoSeedFile(): void {

        for (var nArrFileIndex: number = 0; nArrFileIndex < this.arrFileInfo.length; ++nArrFileIndex) {

            var files: string[] = this.arrFileInfo[nArrFileIndex].files;

            for (var nFilesIndex: number = 0; nFilesIndex < files.length; ++nFilesIndex) {

                var file: string = files[nFilesIndex];

                for (var nNoSeedfilesIndex: number = 0; nNoSeedfilesIndex < this._data.noseedfiles.length; ++nNoSeedfilesIndex) {

                    var neSeedFile: string = this._data.noseedfiles[nNoSeedfilesIndex];

                    var isin = file.indexOf(neSeedFile);

                    if (isin == -1) {
                        continue;
                    }

                    files.splice(nFilesIndex, 1);

                    --nFilesIndex;

                    break;
                }
            }
        }
    }
}