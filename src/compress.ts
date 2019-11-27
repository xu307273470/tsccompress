import UglifyJS = require('uglify-js');
import fs = require("fs");
import join = require('path');

import ISample = require('./isample');
import utils = require('./utils');
import base = require('./base');
import common = require('./common');
import game = require('./game');

export class compress {

    _data: any

    _utils: utils.utils;

    constructor() {
        this._utils = new utils.utils();
    }

    // 压缩
    compress(): void {

        if (!this.analysisPackJson()) {
            console.log("解析 package.json 文件 失败");
            return;
        }

        // var files: ISample.IFilesInfo[] = [];
        // var obj: base.base | common.common | undefined = undefined;

        for (var nIndex = 0; nIndex < this._data.moduleInfo.length; ++nIndex) {

            var info = this._data.moduleInfo[nIndex];

            if (!info.ispackage) {
                continue
            }

            if (info.name == "base") {
                new base.base(info, this);
                continue;
            }
            if (info.name == "common") {
                new common.common(info, this);
                continue;
            }

            if (info.name == "game1") {
                new game.game(info, this);
                continue;
            }
        }

        console.log("全部压缩完成");
    }

    // 解析配置文件
    analysisPackJson(): boolean {

        console.log("开始解析 bin/res/package.json 文件");

        var packageJosnPath = "./bin/res/package.json";

        var isExists = fs.existsSync(packageJosnPath);

        if (!isExists) {
            console.log("解析 bin/res/package.json 失败，请检查改文件是否正确");
            return false;
        }

        var data = JSON.parse(fs.readFileSync(packageJosnPath).toString("utf-8"));

        this._data = data;

        return true;
    }

    // 开始压缩
    starCompress(files: ISample.IFilesInfo[], moduleData: any): void {


        var options = {
            mangle: true,           //输出变量名替换后的文件
            compress: {
                sequences: true,        //使用逗号操作符加入连续的简单语句
                dead_code: true,        //移除不可达的代码
                conditionals: true,     //为if -else 和条件表达式应用优化
                booleans: true,         //多种针对布尔上下文的优化，例如 !!a ? b : c → a ? b : c
                drop_debugger: true,    //移除调试器和调试语句
                unused: true,           //去掉没有被引用过的函数和变量
                if_return: true,        //这对 if/return 和 if/continue 的优化
                join_vars: true,        //加入连续的var语句
                drop_console: true      //默认为false.  传入true会丢弃对console.函数的调用.
            },
        };

        for (var nFilesIndex = 0; nFilesIndex < files.length; ++nFilesIndex) {

            var datalst: any[] = [];

            for (var j = 0; j < files[nFilesIndex].files.length; j++) {

                var str_length: number = files[nFilesIndex].files[j].length;

                var file: string = files[nFilesIndex].files[j]

                var sub_str = file.substr(str_length - 3, str_length);

                if (sub_str !== ".js") {
                    continue;
                }

                var js_content = fs.readFileSync(file, "utf8");

                if (!js_content) {
                    continue;
                }

                datalst[j] = fs.readFileSync(file, "utf8");
            }

            this._utils.createDirsSync(files[nFilesIndex].path);

            var exprotminjsname = files[nFilesIndex].path + moduleData.name + ".min.js";

            fs.writeFileSync(exprotminjsname, UglifyJS.minify(datalst, options).code, "utf8");
        }

    }
}
