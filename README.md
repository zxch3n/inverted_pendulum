# inverted pendulum

A simulation of inverted pendulum.

This is one of my homework ;)

Enviroment: 

- python3(with django installed)

run: 

> python manage.py runserver


## Watching and Loging the Autocontrol

After you started the server, open a broswer to the corresponding website then you should see a inverted pendulum.

By default this is controled by the server to maintain balance. You can input the number from 0 to 1000 to alter the speed. The larger number you input the faster the pendulum return to balance state.

After simulation you can see the log file which record the every moment of the inclination(the sample rate is 60Hz).

## Play

When this game begin it's controled by server which was built by django.

So you should press downward button once to take over the control. Then you can use left and right button to control the accelerate of the pendulum.

