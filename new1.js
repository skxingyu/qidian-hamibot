// --- 请从这里开始复制 ---
console.show();
auto.waitFor();
// if (!requestScreenCapture()) {
//     toastLog('没有授予 Hamibot 屏幕截图权限');
//     hamibot.exit();
// }
sleep(1000)
console.setTitle("自动任务");
console.setPosition(device.width * 2 / 5, 0)
console.setSize(device.width / 3, device.height / 3)
var ham = hamibot.env
var bounds
var centerX
var centerY
var right
var sp = 0
var X
var Y
var InitialValue = null
// var clickResults
// var news = ''
//工具模块
/*//通知
function observeNews() {
    events.observeToast();
    events.onToast(function (toast) {
        news = toast.getText();
    });
}*/
/*var thread = threads.start(function(){
    events.observeToast();
    events.onToast(function (toast) {
        news = toast.getText();
        console.log(news);
    });
});*/

//提取数字
function jstime(textObj) {
    if (textObj == null) {
        return null
    }
    // 存储初始文本内容
    var initText = textObj.text();
    // log(initText)
    //获取时间
    var match = initText.match(/\d+/g);
    return match ? parseInt(match[0]) : null;
}


//提取坐标中心
function getXy(obj) {
    if (obj == null) {
        return null;
    }
    var bounds = obj.bounds();
    return {
        centerX: (bounds.left + bounds.right) / 2,
        centerY: (bounds.top + bounds.bottom) / 2
    };
}

//点击坐标中心
function clickCenter(params) {
    var center = getXy(params);
    if (center == null) {
        console.log('没找到')
        return
    }
    click(center.centerX, center.centerY);
    console.log('点击坐标')
}

//返回首页
function backHome(params) {
    do {
        back()
    } while (id("normal").findOne(500) == null)
    console.log('已到主界面');
}


function clickParentIfClickable(widget) {
    if (InitialValue == null) {
        InitialValue = widget
    }
    if (widget === null) {
        console.log('找不到');
        InitialValue = null
        return null;  // 终止递归的条件：如果 widget 是空值，则结束递归
    }
    if (widget.click()) {
        console.log('已点击');
        InitialValue = null
        return true;  // 点击控件
    }
    var parentWidget = widget.parent();  // 获取控件的父类
    if (parentWidget === null) {
        console.log('不可点击');
        clickCenter(InitialValue)
        InitialValue = null
        return false;
    }
    return clickParentIfClickable(parentWidget);
    // 递归调用自身，传入父类控件进行下一次查找和点击
}


function longClickParentIfClickable(widget) {
    if (widget === null) {
        console.log('找不到');
        return null;  // 终止递归的条件：如果 widget 是空值，则结束递归
    }
    if (widget.longClick()) {
        console.log('已长按');
        return true;  // 点击控件
    }
    var parentWidget = widget.parent();  // 获取控件的父类
    if (parentWidget === null) {
        console.log('不可长按');
        return false
    }
    return longClickParentIfClickable(parentWidget);  // 递归调用自身，传入父类控件进行下一次查找和点击
}


//主界面模块
//启动起点获取坐标中心点
function start() {
    log("start函数开始执行");
    if (auto.service == null) {
        log("请先开启无障碍服务！");
    } else {
        log("无障碍服务已开启");
        home();
        log("执行home()");
        sleep(1000);
        launch("com.qidian.QDReader");
        log("尝试启动起点App");
        waitForActivity('com.qidian.QDReader.ui.activity.MainGroupActivity');
        log("已等到主界面，start函数即将结束");
        back();
        bounds = className("android.widget.FrameLayout").depth(0).findOne();
        centerX = getXy(bounds).centerX;
        centerY = getXy(bounds).centerY;
        right = bounds.bounds().right;
        log("应用已启动，参数设置完毕");
    }
}

//签到
// [新版本] 替换旧的qdao()函数
function qdao() {
    log("签到")
    clickParentIfClickable(text("我").findOne())
    clickParentIfClickable(text("我知道了").findOne(1000))
    clickParentIfClickable(text("福利中心").findOne())
    log("等待福利中心加载")
    text("看视频得奖励").waitFor()
    var today = new Date();
    var dayOfWeek = today.getDay();
    var thread = threads.start(function () {
        events.observeToast();
        events.onToast(function (toast) {
            let news = toast.getText();
            if (news && news.indexOf('风险等级') != -1) {
                console.log(news);
                engines.stopAllAndToast()
            }
        });
    });
    clickParentIfClickable(text("今日已签到").findOne(1000))
    log("抽奖详情")

    // [修改点] 增加了防卡死机制
    let attempt_count = 0;
    const MAX_ATTEMPTS = 5; // 如果连续5次找不到任务，就退出

    if (text("抽奖机会 ×0").findOne(500)) {
        console.log('无抽奖');
    } else {
        do {
            let action_found = false; // 用来标记本轮循环是否找到了任务

            if (textMatches(/抽奖机会 ×\d+/).exists()) {
                log('找到抽奖机会，开始抽奖');
                clickParentIfClickable(textMatches(/抽奖机会 ×\d+/).findOne());
                do {
                    if (clickParentIfClickable(text("抽奖").findOne(1500)) == null) {
                        home();
                        sleep(1000);
                        launch("com.qidian.QDReader");
                    }
                    sleep(3000);
                } while (!(text("抽奖机会 ×0").exists() || text("看视频抽奖机会+1").exists() || text("看视频可抽奖").exists()));
                action_found = true; // 标记找到了任务
            } else if (text("看视频可抽奖").exists()) {
                log('找到看视频任务，开始看视频');
                clickParentIfClickable(text("看视频可抽奖").findOne());
                if (clickParentIfClickable(text("看视频抽奖机会+1").findOne(1500)) == null) {
                    home();
                    sleep(1000);
                    launch("com.qidian.QDReader");
                }
                waitad();
                do {
                    sleep(3000);
                } while (clickParentIfClickable(text("看视频抽奖机会+1").findOne(1000)) != null);
                action_found = true; // 标记找到了任务
            }

            // 如果上面所有条件都没匹配到，说明没找到可做的任务
            if (!action_found) {
                attempt_count++;
                log("未找到可执行的抽奖任务，尝试次数: " + attempt_count + "/" + MAX_ATTEMPTS);
                sleep(2000); // 等待2秒，以防界面是延迟加载
            } else {
                attempt_count = 0; // 如果成功执行了任务，就重置计数器
            }

            // 如果连续尝试次数达到上限，就强制跳出循环
            if (attempt_count >= MAX_ATTEMPTS) {
                log("多次尝试后仍未找到抽奖任务，可能界面已更新，跳出抽奖环节。");
                break;
            }

        } while (!(text("抽奖 ×0").exists() || text("明天再来").exists()));
    }

    //停止线程执行
    thread.interrupt();
    
    //兑换章节卡
    if (dayOfWeek === 0) {
        log("今天是周日");
        clickParentIfClickable(text("去兑换 周日").findOne(1500));
        sleep(2000);
        let redeemButtons = text("兑换").find();
        if (redeemButtons.nonEmpty()) {
            clickParentIfClickable(redeemButtons[redeemButtons.length - 1]);
            sleep(2000);
            redeemButtons = text("兑换").find();
            if (redeemButtons.nonEmpty()) {
                clickParentIfClickable(redeemButtons[redeemButtons.length - 1]);
            }
        }
        sleep(2500);
    } else {
        log("今天不是周日");
    }
    backHome();
}

//精选模块
//激励碎片
function looksp() {
    log('领碎片')
    clickParentIfClickable(text("精选").findOne())
    log('已进入精选')
    clickParentIfClickable(text("新书").findOne())
    clickParentIfClickable(text("换一换").findOne())
    sleep(800)
    clickParentIfClickable(id("rootBookLayout").findOne())
    log('已进入小说详细页')
    clickParentIfClickable(textEndsWith("阅读").findOne())
    log('已打开小说')
    waitForActivity("com.qidian.QDReader.ui.activity.QDReaderActivity");
    // sleep(2000)
    // var action
    // var currentPage
    //找红包
    while (true) {
        do {
            log('找红包位置')
            while (true) {
                do {
                    click(right - 1, centerY);
                } while (id("tag").exists())
                click(centerX, centerY);
                log('点击屏幕')
                sleep(700)
                if (text("目录").exists()) {
                    break
                }
                if (text("粉丝值说明").exists() || text("全部").exists() || textMatches(/书友圈\d+书友正在讨论/).exists() || text("快去参与讨论").exists()) {
                    back()
                    sleep(1000)
                } else if (text("发表").exists()) {
                    back()
                    back()
                    sleep(1000)
                }
            }
            clickParentIfClickable(text("下一章").findOne())
            // waitForActivity("com.qidian.QDReader.ui.activity.QDReaderActivity");
            click(1, centerY);
            click(1, centerY);
            sleep(800)
        } while (!textEndsWith("红包").exists())
        log('红包位置已找到')
        if (textStartsWith("0个").exists()) {
            log('没有红包')
            break
        }
        // var is
        // clickParentIfClickable(text("立即领取").findOne())
        // currentPage = currentActivity();
        do {

            log('点击红包')
            clickParentIfClickable(textEndsWith("红包").findOne())
            log('打开红包')
            // clickParentIfClickable(id("layoutHongbaoRoot").findOne())
            text("红包广场").waitFor()
            sleep(1000)
            if (text("当前章节暂无红包").exists()) {
                break
            }
            text("马上抢").waitFor()
            clickParentIfClickable(text("马上抢").findOne())
            //看视频
            waitad()
            //领碎片
            log('领碎片')

        } while (clickParentIfClickable(text("立即领取").findOne(3000)) == null)
        /*sleep(500)
        if (id("btnOk").exists()) {
            id("btnOk").findOne().click()
        }*/
        clickParentIfClickable(id("btnOk").findOne(500))
        do {
            click(right - 1, centerY);
        } while (text("红包").exists() || id("tag").exists())
    }
    log('碎片已领完')
    back()
    clickParentIfClickable(text("取消").findOne(500))
    backHome()

}


//福利中心模块
//看视频
function lookvd() {
    clickParentIfClickable(text("我").findOne())
    // waitForActivity('com.qidian.QDReader.ui.activity.MainGroupActivity')
    clickParentIfClickable(text("我知道了").findOne(1000))
    clickParentIfClickable(text("福利中心").findOne())
    log("等待福利中心加载")
    //text("限时彩蛋").waitFor()
    text("看视频得奖励").waitFor()
    var thread1 = threads.start(function () {
        // 这个线程的逻辑不是基于Toast，保持原样
        let stop = textContains("领奖上限").findOne()
        if (stop) {
            console.log(stop.text());
            engines.stopAllAndToast();
        }
    });
    var thread2 = threads.start(function () {
        events.observeToast();
        events.onToast(function (toast) {
            let news = toast.getText();
            // [修改点] 增加 news && 的判断，确保在内容不为空时才执行后续操作
            if (news && news.indexOf('风险等级') != -1) {
                console.log(news);
                engines.stopAllAndToast();
            }
        });
    });

    log("开始查找并完成所有“看视频”任务...");
    // 循环处理所有“看视频”按钮
    while (true) {
        // Hamibot兼容性修改：移除了findOne()中的超时参数
        let watchButton = text("看视频").findOne();

        // 如果第一次没找到按钮，可能是界面还没加载完，等待一下再试一次
        if (watchButton == null) {
            sleep(2000); // 等待2秒，给界面一个加载的时间
            watchButton = text("看视频").findOne(); // 再次查找
            // 如果再次查找后仍然没有，说明任务确实完成了，退出循环
            if (watchButton == null) {
                log("在当前页面找不到“看视频”按钮，判定所有视频任务已完成。");
                break;
            }
        }
        
        log("找到一个“看视频”任务，准备点击...");
        if (clickParentIfClickable(watchButton)) {
            // 调用函数等待广告播放
            waitad();
            // 广告结束后，可能会有“知道了”的弹窗，点击关闭
            clickParentIfClickable(text("我知道了").findOne(500));
            // 短暂休眠1.5秒，等待界面刷新
            sleep(1500);
        } else {
            // 如果因某些原因点击失败，记录日志并跳出，防止无限循环
            log("点击“看视频”按钮失败，任务中止。");
            break;
        }
    }
    log('视频已看完')
    bounds = className("android.widget.FrameLayout").depth(0).findOne()
    centerX = getXy(bounds).centerX;
    centerY = getXy(bounds).centerY;
    swipe(centerX, centerY, centerX, 0, 1000)
    log("听书")
    listenToBook()
    log("玩游戏")
    play()
    log("领取奖励")
    getPrize()
    //停止线程执行
    thread1.interrupt();
    thread2.interrupt();
    // log("碎片兑换")
    // buy()
    backHome()
}

//等待广告
function waitad() {

    log('看广告')
    // 广告时间对象
    var reward
    //等待广告出现
    while (className("android.view.View").depth(4).exists()) {
        sleep(500)
    }
//等待广告时间对象
    reward = textEndsWith("可获得奖励").findOne(7000)
    if (reward == null) {
        if (className("android.view.View").depth(4).exists()) {
            while (className("android.view.View").depth(4).exists()) {
                sleep(500)
            }
            if (!textEndsWith("可获得奖励").exists()) {
                back()
                sleep(500)
                console.log('广告未加载1');
                return
            }
        } else if (className("android.view.View").depth(5).exists()) {
            back()
            sleep(500)
            console.log('广告未加载2');
            return
        }
        // else if (className("android.widget.TextView").findOne(1000) || className("android.widget.ProgressBar").findOne(1000) || className("android.view.ViewGroup").depth(14).findOne(1000) || className("android.view.View").depth(16).findOne(1000) || ocr.recognizeText(captureScreen()).text.match(/观看.*可获得/)) {
        //     do {
        //         sleep(1000)
        //     } while (className("android.widget.TextView").findOne(1000) || className("android.widget.ProgressBar").findOne(1000) || className("android.view.ViewGroup").depth(14).findOne(1000) || className("android.view.View").depth(16).findOne(1000))
        //     waitad2()
        //     return;
        // }
        else {
            console.log('未进入广告页面');
            return
        }
    }
    //等待广告出现
    while (className("android.view.View").depth(4).exists()) {
        sleep(500)
    }
    if (!textEndsWith("可获得奖励").exists()) {
        back()
        sleep(500)
        console.log('广告未加载3');
        return
    }
    //获取关闭坐标
    var gb = text("关闭").findOne(400)
    var cross = text("cross").findOne(400)
    var tg = text("跳过广告").findOne(400)
    // var wz = text("此图片未加标签。打开右上角的“更多选项”菜单即可获取图片说明。").findOnce()
    var zb = null
    if (gb) {
        zb = gb
    } else if (cross) {
        zb = cross
    } else if (tg) {
        zb = tg
    } /*else if (wz) {
        zb = wz
    }*/
    if (zb == null) {
        console.log('获取关闭坐标')
        var video_quit = reward.bounds()
        var x1 = 0;
        var x2 = video_quit.left;
        var y1 = video_quit.top;
        var y2 = video_quit.bottom;
        X = parseInt((x1 + x2) / 2)
        Y = parseInt((y1 + y2) / 2)
        // var nocross = true
    }
    // 获取等待时间
    let textObj = textEndsWith("可获得奖励").findOne()
    var time = jstime(textObj)
    if (textObj.text().includes("有声书")) {
        if (zb == null) {
            click(X, Y)
        } else {
            clickParentIfClickable(zb)
        }
        sleep(500)
        clickParentIfClickable(textStartsWith("继续").findOne())
    }
    if (time == null) {
        log('获取不到时间，重新获取')
        log('点击退出')
        do {
            if (!textEndsWith("可获得奖励").exists()) {
                back()
                sleep(500)
                console.log('获取不到坐标')
                return
            }
            if (zb == null) {
                click(X, Y)
            } else {
                clickParentIfClickable(zb)
            }
            sleep(500)
        } while (!textStartsWith("继续").exists())
        time = jstime(textEndsWith("可获得奖励").findOne())
        clickParentIfClickable(textStartsWith("继续").findOne())
        /*
                if (time == null) {
                    time = textMatches(/\d+/).findOnce()
                    if (time) {
                        time = parseInt(time.text())
                    }
                }
        */
    }

//等待广告结束
    var num
    if (time) {
        log('等待' + (time + 1) + '秒')
        sleep(1000 * (time + 1))
        num = 0
        do {
            if (zb == null) {
                click(X, Y)
            } else {
                clickParentIfClickable(zb)
            }
            if (clickParentIfClickable(textStartsWith("继续").findOne(500))) {
                sleep(1000)
                num++
                log('等待' + num + '秒')
            }
        } while (textEndsWith("可获得奖励").exists());
    } else {
//获取不到时间
        log('等待视频结束')
        // clickParentIfClickable(text("继续观看").findOne())
        num = 0
        do {
            num++
            sleep(1000)
            log('等待' + num + '秒')
        } while (textEndsWith("可获得奖励").exists());
    }
//判断是否还在广告页面
    if (className("android.view.View").depth(5).exists()) {
        back()
        sleep(500)
    }
    log('广告结束')
    sp++
    clickParentIfClickable(text("知道了").findOne(1500))
    log('已看视频' + sp + '个')
    sleep(1000)
}

//等待广告
/*
function waitad2() {

    console.log('获取关闭坐标')
    // var templ = images.read('https://tutu.to/image/hBWyI');
    var templ = images.read('https://www.helloimg.com/i/2025/01/10/6781031fc8fbc.png');
    var p = findImage(captureScreen(), templ);
    X = p.x
    Y = p.y
    do {
        // 获取等待时间
        time = ocr.recognizeText(captureScreen()).text.match(/观看.*可获得/).match(/\d+/g)
        //等待广告结束
        log('等待' + (time + 1) + '秒')
        sleep(1000 * (time + 1))
    } while (ocr.recognizeText(captureScreen()).text.match(/恭喜获得/) == null);
    click(X, Y)
    log('广告结束')
    sp++
    log('已看视频' + sp + '个')
}
*/
function waitad2() {
    console.log('获取关闭');
    // 图片URL地址
    var templUrl = 'https://www.helloimg.com/i/2025/01/10/6781031fc8fbc.png';
    // 下载图片到本地
    var downloadPath = '/sdcard/templ.png'; // 指定下载路径
    http.get(templUrl, function (error, response) {
        console.log(1)
        if (!error && response.statusCode == 200) {
            // 将图片内容保存到本地文件
            files.writeBytes(downloadPath, response.body.bytes());
            // 从本地加载图片
            var templ = images.read(downloadPath);
            console.log(2)
            if (templ) {
                var p = findImage(captureScreen(), templ);
                if (p) {
                    var X = p.x;
                    var Y = p.y;
                    do {
                        // 获取等待时间
                        var screenText = ocr.recognizeText(captureScreen()).text;
                        var timeMatch = screenText.match(/观看.*可获得/);
                        if (timeMatch) {
                            var time = timeMatch[0].match(/\d+/g);
                            if (time) {
                                time = parseInt(time[0], 10);
                                // 等待广告结束
                                console.log('等待' + (time + 1) + '秒');
                                sleep(1000 * (time + 1));
                            }
                        }
                    } while (!screenText.match(/恭喜获得/));
                    click(X, Y);
                    console.log('广告结束');
                    sp++;
                    console.log('已看视频' + sp + '个');
                } else {
                    console.log('未找到关闭广告的坐标');
                }
            } else {
                console.error('模板图片加载失败，请检查下载路径是否正确：' + downloadPath);
            }
        } else {
            console.error('下载图片失败，错误信息：', error);
        }
    });
}

//兑换
function buy() {
    clickParentIfClickable(desc('更多好礼').findOne())
    text('畅享卡').waitFor()
    var enjoyCard = textStartsWith('7天').findOne().parent().parent()
    var convertibleList = enjoyCard.find(text('兑换'))
    if (convertibleList.length > 0) {
        for (let i = convertibleList.length - 1; i >= 0; i--) {
            clickParentIfClickable(convertibleList[i])
            clickParentIfClickable(text("确认").findOne(2000))
            sleep(500)
        }

    }
    console.log('已兑换')

}

//听书
function listenToBook() {
    var bookV
    // let listenTime
    bookV = textContains("当日听书").findOne(1000)
    if (bookV == null) {
        console.log('没有听书')
        return
    }
    // let listeningTime = jstime(bookV);
    // if (textContains("当日玩游戏").findOnce() == null) {
    //      listenTime = jstime(bookVs);
    // }
    bookV = bookV.parent()
    if (clickParentIfClickable(bookV.findOne(text('去完成'))) != null) {
        sleep(1500)
        let isback = false
        if (text("听原创小说").exists()) {
            isback = true
            text("听原创小说").waitFor()
            clickParentIfClickable(id("playIv").findOne())
        }
        id("ivPlayCenter").waitFor()
//         sleep(1000 * 10)
        back()
        clickParentIfClickable(id("btnLeft").findOne(850))
        if (isback) {
            back()
        }
    }
}

//玩游戏
function play() {
    var game
    game = textContains("当日玩游戏").findOne(1000)
    if (game == null) {
        console.log('没有游戏可玩')
        return
    }
    game = game.parent()
    let finishing
    var pt
    device.keepScreenDim();
    while ((finishing = game.findOne(textMatches(/ 再玩\d+分钟可获得 /))) != null) {
        pt = jstime(finishing)
        if (pt == null) {
            break
        }
        // log(pt)
        // var repetitions = 4
        do {

            // if (!clickParentIfClickable(text('去完成').findOne(1500))) {
            //     back()
            //     clickParentIfClickable(text("游戏中心").findOne())
            // }
            // clickParentIfClickable(text('去完成').findOne(1500))
            className("android.widget.TextView").text("去完成").clickable(true).depth(16).findOne().click()
            sleep(1000)
        } while (textContains("当日玩游戏").exists());
        /*log("前往游戏中心")
        textContains("热门").waitFor()
        // textContains("喜欢").waitFor()
        textContains("推荐").waitFor()
        if (clickParentIfClickable(text("排行").findOne(5000)) == null) {
            clickParentIfClickable(text("在线玩").findOne())
        } else {
            text("新游榜").waitFor()
            text("热门榜").waitFor()
            text("畅销榜").waitFor()
            clickParentIfClickable(text("热门榜").findOne())
            clickParentIfClickable(text("在线玩").findOne())
            // repetitions++
        }*/
        log("进入游戏")
        log('剩余' + (pt + 0.5) + '分钟')
        startCountdown(pt + 0.5)
        backHome()
        log("重新进入福利中心")
        clickParentIfClickable(text("我").findOne())
        // waitForActivity('com.qidian.QDReader.ui.activity.MainGroupActivity')
        // clickParentIfClickable(text("我知道了").findOne(750))
        clickParentIfClickable(text("福利中心").findOne())
        log("等待福利中心加载")
        // text("限时彩蛋").waitFor()
        text("看视频得奖励").waitFor()
        bounds = className("android.widget.FrameLayout").depth(0).findOne()
        centerX = getXy(bounds).centerX;
        centerY = getXy(bounds).centerY;
        swipe(centerX, centerY, centerX, 0, 1000)
        game = textContains("当日玩游戏").findOne(1000)
        game = game.parent()
    }
    device.cancelKeepingAwake();
}

//领取
function getPrize() {
    var prizePool
    prizePool = text("领奖励").find()
    for (i = 0; i < prizePool.length; i++) {
        // prizePool[i].click()
        clickParentIfClickable(prizePool[i])
        clickParentIfClickable(text("我知道了").findOne(750))
    }
    clickParentIfClickable(id("ivClose").findOne(500))
}

//倒计时
function startCountdown(minutes) {
    var count = minutes * 60; // 倒计时的秒数
    var remainingMinutes
    var remainingSeconds
    for (var i = count; i >= 0; i--) {
        remainingMinutes = Math.floor(i / 60); // 剩余分钟数
        remainingSeconds = i % 60; // 剩余秒数
        //清除控制台
        console.clear()
        // 每分钟提示倒计时
        if (i > 60) {
            log("倒计时还剩 " + remainingMinutes + " 分钟 " + remainingSeconds + " 秒 ");
        }
        // 剩余60秒钟提示倒计时
        if (i <= 60) {
            log("倒计时还剩 " + i + " 秒");
        }
        sleep(1000); // 等待1秒
        device.wakeUpIfNeeded();
    }
    console.clear()
    log("倒计时已结束");
}


// start()
// //签到
// if (ham.checkbox_01) {
//     qdao()
// }
// //领碎片
// if (ham.checkbox_02) {
//     looksp()
// }
// //做福利任务
// if (ham.checkbox_03) {
//     lookvd()
// }
// /*//停止线程执行
// thread.interrupt();*/
// console.hide()
// engines.stopAllAndToast()
// // --- 请复制到这里结束 ---
start()
//做福利任务 (优先执行)
lookvd()

//领碎片
looksp()

//签到 (放到最后)
qdao()

/*//停止线程执行
thread.interrupt();*/
console.hide()
engines.stopAllAndToast()