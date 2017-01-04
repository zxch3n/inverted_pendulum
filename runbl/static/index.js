var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var height = canvas.clientHeight,
    width  = canvas.clientWidth;

var d = new Date()
var randPath = d.getHours() +''+ d.getSeconds() + parseInt(Math.random()*1000);

function Car(){
    // 假设m=1kg, l=1m
    this.count = 0;
    this.x = 200;
    this.speedX = 0;
    this.acc = 0;
    this.isman = false;
    // 倾斜角度，弧度制
    this.tiltRate = 0;
    this.tiltSpeed = 0;
    this.tiltAcc = 0;
    this._to_slow = 0;
    this._is_slow = false;
}

function limit(value, l, r){
    if(value < l)return l;
    if(value > r)return r;
    return value;
}

Car.prototype = {
    // 常量
    BASE_W: 90,
    BASE_H: 20,
    CIRCLE_R: 10,
    BAR_W: 10,
    BAR_H: 300,
    // 变化率(帧率倒数)
    TILT: 1/60,

    // 函数
    move: function(){
        // 更新速度以及倾斜角度,倾斜角加速度
        this.slowdown();
        this.x += this.speedX * this.TILT * 20;
        this.speedX += this.acc * this.TILT * 20;
        this.tiltSpeed += this.tiltAcc * this.TILT;
        var oldRate = this.tiltRate;
        this.tiltRate = limit(this.tiltRate + this.tiltSpeed * this.TILT,
                        -Math.PI/2,
                        Math.PI/2);
        // 下面语句成立时触底
        if(oldRate == this.tiltRate && Math.abs(this.tiltSpeed) > 0.1){
            this.tiltSpeed = -this.tiltSpeed / 2;
        }
        this.count += 1;
    },
    slowdown: function(){// 第一个参数为true时表示要进行减速
        if(arguments[0] && arguments[0]==true){
            this._to_slow = this.speedX;
            this._is_slow = true;
        }
        if(arguments[0] && arguments[0]==false){
            this._is_slow = false;
            return;
        }
        if(!this._is_slow)return;
        this.acc = - this.speedX / 3;
        if(this.speedX * this._to_slow < 0 || Math.abs(this.speedX) < 0.5){
            this.acc = 0;
            this._is_slow = false;
        }
    },
    tilt: function(){
        // 更新角加速度
        var r = this.tiltRate, sp = this.tiltSpeed,
            sinr = Math.sin(this.tiltRate),
            cosr = Math.cos(this.tiltRate),
            cos2r = Math.cos(2*this.tiltRate);
        this.tiltAcc = (10*sinr + 2*sinr*sp*sp*cosr - this.acc*cosr)/(2+cos2r);
    },
    _draw_bar: function(x){
        ctx.save();
        ctx.translate(-this.BAR_W/2,
                      height-this.CIRCLE_R/2-this.BASE_H+this.BAR_W/2);
        ctx.rotate(this.tiltRate);
        ctx.fillStyle="rgb(102,12,150)";
        ctx.fillRect(-this.BAR_W/2, 0, this.BAR_W, -this.BAR_H);
        ctx.restore();
    },
    showInfo: function(){
        ctx.clearRect(0, 0, 360, 180);
        ctx.font = "16px serif";
        ctx.fillText("Speed: " + this.speedX, 10, 30);
        ctx.fillText("Accelerate: " + this.acc, 10, 60);
        ctx.fillText("角速度: " + this.tiltSpeed, 10, 90);
        ctx.fillText("角度: " + this.tiltRate, 10, 120);
        ctx.fillText("角加速度: " + this.tiltAcc, 10, 150);
        ctx.fillText("当前操作为玩家: " + this.isman, 10, 180);
    },
    draw: function(){
        ctx.save();
        var x = (this.x % (width / 2) + width/2 ) % (width / 2);
        if(arguments[0] && arguments[0] == 'static'){
            x = width/2;
            ctx.save();
            ctx.translate(x, height - 30);
            ctx.fillStyle="rgb(122,222,90)";
            ctx.fillRect(0, 0, this.acc*20, 20);
            ctx.fillRect(0, 0, 2, 20);
            ctx.restore();
        }
        ctx.translate(x, -40);
        this._draw_bar(x);
        ctx.fillStyle="rgb(122,122,50)";
        ctx.fillRect(-this.BASE_W/2,
                    height-this.CIRCLE_R/2-this.BASE_H,
                    this.BASE_W, this.BASE_H);
        ctx.fillStyle="rgb(120,9,70)";
        ctx.beginPath();
        ctx.arc(-this.BASE_W/4,
                height-this.CIRCLE_R/2,
                this.CIRCLE_R, 0, Math.PI*2, true);
        ctx.arc(+this.BASE_W/4,
                height-this.CIRCLE_R/2,
                this.CIRCLE_R, 0, Math.PI*2, true);
        ctx.fill();
        ctx.restore();
    }
}


var car = new Car();
car.tiltRate = -Math.PI/3;
var changeAcc = 0;
var changeAcc_ = false;
var rate = 0.2;
var btn = document.getElementById('btn');
var text = document.getElementById('tx');
btn.onclick = function(event){
    rate = text.value;
    car = new Car();
    car.tiltRate = -Math.PI/3;
    randPath = d.getHours() +''+ d.getSeconds() + parseInt(Math.random()*1000);
}

function post_get_acc(car){
    if(car.count > 9000) return;
    var data = {
        acc: car.acc,
        tiltRate: car.tiltRate,
        tiltSpeed: car.tiltSpeed,
        tiltAcc: car.tiltAcc,
        randPath: randPath,
        rate:rate
    };
    changeAcc = 0;
    $.ajax({
        type: 'POST',
        url: 'sim/',
        data: data,
        async: false,
        success: function(data){
            data = eval(data);
            car.acc = data;
        },
    });
}

function animation(){
    ctx.clearRect(0, 240, width, height);
    car.draw('static');
    car.tilt();
    car.move();
    if(!car.isman){
        // 通过加加速度来更新加速度
        post_get_acc(car);
        car.acc += changeAcc;
    }else{
        if(changeAcc_){
            car.acc *= 0.8;
            if(Math.abs(car.acc) < 0.3){
                car.acc = 0;
                changeAcc_ = false;
            }
        }else{
            car.acc += changeAcc;
        }
    }
    window.requestAnimationFrame(animation);
}
function showInfo(){
    car.showInfo();
    setTimeout(showInfo, 200);
}
animation();
showInfo();

document.addEventListener('keydown', function(e){

    if(!e)return;
    if(e.keyCode == 38){// UP
        car.tiltSpeed = -car.tiltRate;
    }else if(e.keyCode == 13){// Enter
        // 重启游戏
        car = new Car();
    }else if(e.keyCode == 37){// Left
        // 按左键时向左加速
        // 调整加加速度
        changeAcc -= 0.05;
        car.slowdown(false);
        changeAcc_ = false;
    }else if(e.keyCode == 39){// right
        // 按右键时向右加速
        // 调整加加速度
        changeAcc += 0.05;
        car.slowdown(false);
        changeAcc_ = false;
    }else if(e.keyCode == 40){
        car.isman = !car.isman;
    }
}, true);
document.addEventListener('keyup', function(e){
    if(e.keyCode == 37){// Left
        changeAcc = 0;
        changeAcc_ = true;
        // car.slowdown(true);
    }else if(e.keyCode == 39){// right
        changeAcc = 0;
        changeAcc_ = true;
        // car.slowdown(true);
    }
}, true);

