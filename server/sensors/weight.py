import RPi.GPIO as GPIO
from hx711 import HX711

GPIO.setmode(GPIO.BCM)

hx.zero()

reading = hx.get_data_mean(readings=100)