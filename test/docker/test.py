# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os
import time
from urllib import request

from selenium import webdriver as wd
from selenium.webdriver.chrome.options import Options

hub_remote_url = os.environ.get("HUB_REMOTE_URL", "http://selenium-hub:4444/wd/hub")
test_url = os.environ.get("TEST_URL", "http://testui:80/")
retry_interval = int(os.environ.get("RETRY_INTERVAL", "5"))
page_interval = int(os.environ.get("PAGE_INTERVAL", "10"))
hub_status_url = os.environ.get("HUB_STATUS_URL", "http://selenium-hub:4444/wd/hub/status")


def log(message):
    print(message, flush=True)


def test_screenshot():
    log("Opening %s" % test_url)
    driver.get(test_url)
    log("Loaded %s" % driver.current_url)


def wait_for_hub():
    while True:
        try:
            with request.urlopen(hub_status_url, timeout=5) as response:
                body = response.read().decode("utf-8", errors="replace")
                log("Selenium hub is ready: %s" % body)
                return
        except Exception as e:
            log("Waiting for Selenium hub at %s: %s" % (hub_status_url, e))
            time.sleep(retry_interval)

def create_driver():
    wait_for_hub()
    options = Options()
    options.set_capability("browserName", "chrome")
    log("Creating remote Chrome driver via %s" % hub_remote_url)
    return wd.Remote(command_executor=hub_remote_url, options=options)


driver = None

while True:
    try:
        if driver is None:
            driver = create_driver()
            log("Remote Chrome driver created")

        test_screenshot()
        time.sleep(page_interval)
    except Exception as e:
        log("Traffic generator loop failed: %s" % e)
        if driver is not None:
            try:
                driver.quit()
                log("Closed remote Chrome driver")
            except Exception as quit_error:
                log("Failed to close remote Chrome driver: %s" % quit_error)
        driver = None
        time.sleep(retry_interval)
