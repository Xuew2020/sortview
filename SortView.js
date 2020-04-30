(function(window){
	function SortView(array=[],parentNode=null,width=400,height=320,type=0,measure=5,speed=0,padding=30,arrowSize=5){  //构造函数
		this.array = array; 							//待排序数组
		this.parentNode = parentNode; 					//画布容器
		this.canvas = document.createElement('canvas'); //创建画布
		this.width = width; 							//画布宽度
		this.height = height; 							//画布高度
		this.padding = padding; 						//坐标系外边距
		this.arrowSize = arrowSize; 					//坐标系箭头大小
		this.measure = measure; 						//纵轴尺度
		this.range = null; 								//图像内容显示范围
		this.timer = null; 								//定时器
		this.speed = speed;								//定时器时延
		this.type = type; 								//算法类型
		this.sortSet = ["Bubble","Selection","Insertion","Merge","Quick","Heap"];
	}
	SortView.prototype.init = function(){ //初始化
		try{
			var pad = Math.max.apply(null,this.array).toString().length+1;
			if(this.padding<pad*10){
				this.padding = pad*10;
			}
			if(this.width-2*this.padding-this.arrowSize-2<=this.array.length){
				this.width = this.array.length*1.3;
			}
			this.canvas.width = this.width;
			this.canvas.height = this.height;
			var cxt = this.canvas.getContext("2d");
			var width = this.canvas.width;
			var height = this.canvas.height;
			var p = this.padding;
			var a = this.arrowSize;
			this.range = [p+1,p+a+1,width-p-a-1,height-p-1]; //加减一后面图形覆盖坐标系
			/* 绘制坐标系 */
			cxt.beginPath();
			cxt.moveTo(p,p);
			cxt.lineTo(p,height-p);
			cxt.lineTo(width-p,height-p);
			cxt.stroke();
			/*绘制箭头*/
			cxt.beginPath();
			cxt.moveTo(p-a,p+a);
			cxt.lineTo(p,p);
			cxt.lineTo(p+a,p+a);
			cxt.stroke();
			cxt.beginPath();
			cxt.moveTo(width-p-a,height-p+a);
			cxt.lineTo(width-p,height-p);
			cxt.lineTo(width-p-a,height-p-a);
			cxt.stroke();
			/* 绘制纵坐标刻度 */
			var lenY = Math.max.apply(null,this.array);
			for(var i=0; i<=this.measure; i++){
				var text = (lenY*i/this.measure).toFixed(1).toString();
				cxt.font = "1px";
				cxt.textAlign = "right";
				cxt.fillText(text,p*0.8,this.range[3] - Math.ceil((this.range[3]-1.5*p-a)*i/this.measure));
			}
			this.parentNode.appendChild(this.canvas);
			this.iter = this[this.sortSet[this.type]]();
		}catch(e){
			console.log("初始化失败！");
		}
	};
	SortView.prototype.Drewing = function(array){ //绘图
		try{
			var cxt = this.canvas.getContext("2d");
			cxt.clearRect(this.range[0],this.range[1],this.range[2]-this.range[0],this.range[3]-this.range[1]);
			var LenX = array.length;
			var lenY = Math.max.apply(null,array);
			var size = Math.floor((this.range[2]-this.range[0])/LenX);
			cxt.lineWidth = size; 
			for(var i=0; i<LenX; i++){
				cxt.beginPath();
				cxt.moveTo(this.range[0]+(size>>1)+size*i,this.range[3]);
				cxt.lineTo(this.range[0]+(size>>1)+size*i,this.range[3]+1 - Math.floor((this.range[3]-this.range[1])*array[i]/lenY));
				cxt.closePath();
				cxt.stroke();
			}
		}catch(e){
			console.log("图像绘制失败！");
		}
	}
	SortView.prototype.start = function(){ //开始动画
		var that = this;
		this.timer = setInterval(function(){
			var data = that.iter.next();
			if(data.done === true){
				clearInterval(that.timer);
				setTimeout(function(){alert("完成排序")},200);
				return;
			}
			that.Drewing(data.value);
		},that.speed);
	};
	SortView.prototype.stop = function(){ //暂停动画
		clearInterval(this.timer);
	}
	SortView.prototype.Bubble = function*(){ //冒泡排序
		var array = this.array;
		var len = array.length;
		for(var i=0; i<len-1; i++){
			for(var j=0; j<len-i-1; j++){
				if(array[j] > array[j+1]){
					[array[j],array[j+1]] = [array[j+1],array[j]];
					yield array;
				}
			}
		}
	};
	SortView.prototype.Selection = function*(){ //选择排序
		var array = this.array;
		var len = array.length;
		for(var i=0; i<len-1; i++){
			var min = array[i];
			var flag = i;
			for(var j=i+1; j<len; j++){
				if(array[j] < min){
					flag = j;
					min = array[j];
				}
			}
			if(flag != i){
				[array[i],array[flag]] = [array[flag],array[i]];
				yield array;
			}
		}
	}
	SortView.prototype.Insertion = function*(){ //插入排序
		var array = this.array;
		var len = array.length;
		for(var i=1; i<len; i++){
			var tmp = array[i];
			var flag = i;
			for(var j=i-1; j>=0; j--){
				if(tmp>=array[j]){
					break;
				}
				array[j+1] = array[j];
				flag = j;
			}
			array[flag] = tmp;
			yield array;
		}
	}
	SortView.prototype.Merge = function*(){ //归并排序非递归实现
		function merge(subArray,left,mid,right){
			if(left >= right)
				return;
			var tmpArray = [];
			var i=left,j=mid;
			while(i<mid && j<right){
				if(subArray[i] < subArray[j])
					tmpArray.push(subArray[i++]);
				else
					tmpArray.push(subArray[j++]);
			}
			while(i<mid){
				tmpArray.push(subArray[i++]);
			}
			while(j<right){
				tmpArray.push(subArray[j++]);
			}
			for(var i=0,j=left; i<tmpArray.length; i++,j++){
				subArray[j] = tmpArray[i];
			}
		}
		var array = this.array;
		var len = array.length;
		var subLen = 1;
		while(subLen<len){
			for(var i=0;i<len;i+=2*subLen){
				var left=i,mid=i+subLen,right=i+2*subLen;
				if(mid>len) mid = len;
				if(right>len) right = len;
				merge(array,left,mid,right);
				yield array; 
			}
			subLen*=2;
		}
	}
	SortView.prototype.Quick = function*(){ //快速排序非递归实现
		function* partiton(array,left,right){
			var pivot = array[left];
			while(left<right){
				while(left<right && array[right]>=pivot){
					right--;
				}
				array[left] = array[right];
				yield array;
				while(left<right && array[left]<=pivot){
					left++;
				}
				array[right] = array[left];
				yield array;
			}
			array[left] = pivot;
			yield array;
			return left;
		}
		var array = this.array;
		var len = array.length-1;
		var stack = [];
		var mid = yield *partiton(array,0,len);
		if(mid>1){
			stack.push(mid-1);
			stack.push(0);
		}
		if(mid<len-1){
			stack.push(len);
			stack.push(mid+1);
		}
		while(stack != false){
			var left = stack.pop();
			var right = stack.pop();
			mid = yield *partiton(array,left,right);
			if(mid>left+1){
				stack.push(mid-1);
				stack.push(left);
			}
			if(mid<right-1){
				stack.push(right);
				stack.push(mid+1);
			}
		}
	}
	SortView.prototype.Heap = function*(){ //堆排序
		function heapify(array,n,i){
			if(i>=n) return;
			var left = 2*i+1;
			var right = 2*i+2;
			var max = i;
			if(left<n && array[max]<array[left]){
				max = left;
			}
			if(right<n && array[max]<array[right]){
				max = right;
			}
			if(max!=i){
				[array[i],array[max]] = [array[max],array[i]];
				heapify(array,n,max);
			}
		}
		function build_heap(array,n){
			var node = (n-2)>>1;
			for(var i=node; i>=0; i--){
				heapify(array,n,i);
			}
		}
		var array = this.array;
		var len = array.length;
		build_heap(array,len);
		for(var i=len-1; i>=0; i--){
			[array[i],array[0]] = [array[0],array[i]];
			heapify(array,i,0);
			yield array;
		}
	}
	window.SortView = SortView;
})(window);