
import fs = require('fs');
import ISample = require('./isample');
import { compress } from './compress';

export class game {

    private _jsFiles: ISample.IFilesInfo[] = [];

    constructor(data: any, compress: compress) {

        var gameList = data.gamelist;

        for (var nGameIndex = 0; nGameIndex < gameList.length; ++nGameIndex) {

            this._jsFiles = [];

            var gameName = gameList[nGameIndex];

            this.getAllJSFiles(gameName, data);

            if (this._jsFiles.length <= 0) {
                continue;
            }

            console.log("开始压缩 " + data.name + " 模块");

            compress.starCompress(this._jsFiles, data);

            console.log("压缩 " + data.name + " ---成功");
        }
    }

    getAllJSFiles(gameName: string, data: any): void {

        var language = data.language;

        var projectName: string = "/project.json";

        for (var nIndex = 0; nIndex < language.length; ++nIndex) {

            if (language[nIndex] !== "zh") {
                projectName = "/project_" + language[nIndex] + ".json"
            }

            var filepath = data.path +"src/" + gameName + projectName;

            var isExists = fs.existsSync(filepath);

            if (!isExists) {
                console.log("path : " + filepath + " 打开失败，请检查路径下对应的文件");
                continue;
            }

            var pojData = JSON.parse(fs.readFileSync(filepath).toString("utf8"));

            var jslist = pojData["jsList"];

            var tagInfo: ISample.IFilesInfo = {
                files: [],
                path: ""
            }

            for (var j = 0; j < jslist.length; j++) {

                var isin = jslist[j].indexOf("src/" + gameName + "/");

                if (isin == -1) {
                    continue;
                }

                tagInfo.files.push(data.path + jslist[j]);
            }

            tagInfo.files.push(data.path + "main.js");

            tagInfo.path = data.outDir + gameName + "/" + language[nIndex] + "/";

            this._jsFiles.push(tagInfo);
        }
    }
}
