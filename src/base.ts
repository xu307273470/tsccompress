
import fs = require("fs");
import xml2js = require('xml2js');

import ISample = require('./isample');
import { compress } from "./compress";

export class base {

    _data: any

    private _jsFiles: ISample.IFilesInfo[] = [];

    constructor(data: any, compress : compress) {

        this._data = data;

        this.analysis_xml();

        console.log("开始压缩" + data.name + "模块");

        compress.starCompress(this._jsFiles, data);

        console.log("压缩" + data.name + "成功");
    }

    //解析xml文件
    analysis_xml(): void {

        var buf = fs.readFileSync(this._data.xml, "utf8");

        var self = this;

        var taginfo: ISample.IFilesInfo = {
            files: [],
            path: this._data.outDir
        };

        xml2js.parseString(buf, { explicitArray: false }, function (err, json) {
            var arr = json["project"]["target"]["jscomp"]["sources"];
            for (var i = 0; i < arr.length; i++) {
                var filearr = arr[i]["file"];
                if (i == 0) {
                    for (var j = 0; j < filearr.length; j++) {
                        var filename = filearr[j]["$"]["name"];
                        //console.log(filename);
                        taginfo.files.push(self._data.path + filename)
                    }
                }
            }
        });

        this._jsFiles.push(taginfo);
    }
}