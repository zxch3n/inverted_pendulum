from django.shortcuts import render
from django.http import HttpResponse
import math


def index(request):
    return render(request, 'index.html')


def sim_index(request):
    """start sim"""
    if request.method == 'POST':
        data = request.POST
        acc = float(data['acc'])
        tiltRate = float(data['tiltRate'])
        tiltAcc = float(data['tiltAcc'])
        tiltSpeed = float(data['tiltSpeed'])
        randPath = str(data['randPath'])
        rate = float(data['rate'])
        with open(randPath + '_' + str(rate) + '_.csv', 'a') as f:
            f.write(str(tiltRate) + '\n')
        ans = unicode(calculate(acc, tiltRate, tiltAcc, tiltSpeed, rate))
        return HttpResponse(ans)


def calculate(acc, tiltRate, tiltAcc, tiltSpeed, rate):
    r = tiltRate
    sp = tiltSpeed
    sinr = math.sin(tiltRate)
    cosr = math.cos(tiltRate)
    cos2r = math.cos(2 * tiltRate)
    tiltAcc = -sp-r*rate
    return -(tiltAcc*(2+cos2r) - 10*sinr-2*sinr*sp*sp) / cosr
