	/**设置监听器**/
	export function setWatcher(page) {
	    let data = page.data;
	    let watch = page.watch;
	    Object.keys(watch).forEach(v => {
	        let key = v.split('.'); // 将watch中的属性以'.'切分成数组
	        let nowData = data; // 将data赋值给nowData
	        for (let i = 0; i < key.length - 1; i++) { // 遍历key数组的元素，除了最后一个！
	            nowData = nowData[key[i]]; // 将nowData指向它的key属性对象
	        }
	        let lastKey = key[key.length - 1];
	        // 假设key==='my.name',此时nowData===data['my']===data.my,lastKey==='name'
	        let watchFun = watch[v].handler || watch[v]; // 兼容带handler和不带handler的两种写法
	        let deep = watch[v].deep; // 若未设置deep,则为undefine
	        observe(nowData, lastKey, watchFun, deep, page); // 监听nowData对象的lastKey
	    })
	}
	/**监听属性 并执行监听函数**/
	function observe(obj, key, watchFun, deep, page) {
	    var val = obj[key];
	    // 判断deep是true 且 val不能为空 且 typeof val==='object'（数组内数值变化也需要深度监听）
	    if (deep && val != null && typeof val === 'object') {
	        Object.keys(val).forEach(childKey => { // 遍历val对象下的每一个key
	            observe(val, childKey, watchFun, deep, page); // 递归调用监听函数
	        })
	    }
	    let that = this;
	    Object.defineProperty(obj, key, {
	        configurable: true,
	        enumerable: true,
	        set: function (value) {
	            watchFun.call(page, value, val); // value是新值，val是旧值
	            val = value;
	            if (deep) { // 若是深度监听,重新监听该对象，以便监听其属性。
	                observe(obj, key, watchFun, deep, page);
	            }
	        },
	        get: function () {
	            return val;
	        }
	    })
	}
	module.exports = {
	    setWatcher: setWatcher
	}
