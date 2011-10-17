/**
 * Created by JetBrains WebStorm.
 * User: perltzhu
 * Date: 11-10-13
 * Time: 下午5:13
 * To change this template use File | Settings | File Templates.
 */
(function(){
    var readyBound = false;
    var onDomReady = function(fn) {
		bindReady();

		if ( isReady ) {
			fn.call( packageContext );
		} else {
			readyList.push( fn );
		}
	},
    // 文档加载已经完成后执行所有队列操作
	ready = function() {
		if ( !isReady ) {
			isReady = true;

			if ( readyList ) {
				var fn, i = 0;
				while ( (fn = readyList[i++]) ) {
					fn.call( packageContext );
				}

				readyList = null;
			}
		}
	},
    // 绑定加载开始函数
	bindReady = function() {
		if ( readyBound ) return;
		readyBound = true;

		if ( doc.attachEvent ) {
			doc.attachEvent("onreadystatechange", function(){
				if ( doc.readyState === "complete" ) {
					doc.detachEvent( "onreadystatechange", arguments.callee );
					ready();
				}
			});
            //
			if ( doc.documentElement.doScroll && win == win.top ) (function(){
				if ( isReady ) return;

				try {
					doc.documentElement.doScroll("left");
				} catch( error ) {
					setTimeout( arguments.callee, 0 );
					return;
				}

				ready();
			})();
		} else if ( doc.addEventListener ) {
			doc.addEventListener( "DOMContentLoaded", function(){
				doc.removeEventListener( "DOMContentLoaded", arguments.callee, false );
				ready();
			}, false );
		}

		if (win.attachEvent) {
			win.attachEvent("onload", ready);
		} else if (win.addEventListener) {
			win.addEventListener("load", ready, false);
		} else {
			win.onload = ready;
		}
	}
})();