import time
import tensorflow as tf
from tensorflow.python.client import device_lib

if __name__ == "__main__":

    print "=================="
    print "GPU TEST"
    print "=================="
    sess = tf.InteractiveSession()

    # gpu = tf.test.is_gpu_available(
    #     cuda_only=False,
    #     min_cuda_compute_capability=None
    # )

    gpu = tf.test.gpu_device_name()

    if gpu:
        print('Default GPU Device: {}'.format(tf.test.gpu_device_name()))
        print device_lib.list_local_devices()
    else:
        print "not available"