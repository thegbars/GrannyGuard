# GrannyGuard - Steelhacks XII

## Owen Finucan (otf6@pitt.edu / ofinucan7@gmail.com)
## Greyson Barsotti (gjb46@pitt.edu / gbarsotti262@gmail.com)

# Frameworks/Libraries/Technologies
- Vite
- Tailwind
- Shadcn UI
- Roboflow
- YOLO v8
- OpenCV
- Whole bunch more of video libraries

# Backstory
This project was inspired in a way by both of our grandmothers. Specifically, Owen had a recent scare that led to a multi-week hospital visit. Eileen, his grandmother, has lots of health issues (diabetes, oxygen issues, etc). One day, a family friend stopped at Eileen's house and found her in a very confused state. She has her bathtub filling with water, gas burners on, sink water running, candles lit, and all just generally stuff that you don't do, then leave attended. The family friend quickly called 9-11. This is when she was taken to a hospital to find her pulse ox was in the 70s and her blood sugar was in the low 50s. Without the family friend stopping, it is very much in the air what would have happened. It begs the question: can we do something to help and monitor the elderly asynchronously to prevent them from harming themselves?

# Initial Goals
- Be able to track the elderly around their home (for safety reasons) and be able to have a recording of it
- Keep track of essential items (pills, phone, wallets, car keys, etc.) that often get misplaced
- Try to prevent "careless" accidents from happening (leaving sink/faucets on, leaving stove on, leaving doors unlocked, etc.)
- Potentially add a security-system-esque mode to it, where if an unrecognized face was detected in the house, it could be recorded and given to authorities
- Have personalization features to make the system seem less of a burden on the elderly person and more integrated into their life

# Rundown
We really have two connected apps. The first is the elderly person app. It was supposed to be simplistic, non-cluttered, and only show essential elements. This would include relevant healthcare vitals (pulse, blood sugar, etc.), reminders for what they needed to do that day (when to take pills, Dr's appointments, etc.), and have an overview of their house. In the overview, there would be indicators where essential items were in the house (medicine, wallet, keys, etc.). Then there is the "trusted adult" app. This would be essentially an oversight account for the elderly person (think this is an actual account versus the elderly person's "child" account). They would be able to add reminders for the elderly person, add new essential items (this can be anything but intention was medicine, wallet, keys, etc.). 

# Main Working Features
- Movement tracking around the house (done with a combination of OpenCV, Yolo v8, and calibration squares to calculate real-time distance/movement)
- Key Item detection (via a Roboflow model) and subsequent tracking of said items around the house
- React / Vite front end
- Backend database to store relevant information about locations and the time an item was last seen
  
# Planned features that were left on the cutting room floor
- Detection of stove being turned on (via Apriltags)
- Detection of doors being unlocked (via Apriltags)
- Detection of running water (via a greyscale mask & motion detector)
- Smoothing feature for the map that would prevent sudden jumps in movement
- Face detection (with features from OpenCV)
- Fall detection (via OpenPose or MediaPipe)
- More personalization (having cameras be in custom designs, more personalization on the elderly person's dashboard, etc.)

# Conclusion
Time management is really hard. Much of the time was spent on measuring out distances and taping squares onto the ground to get a semi-accurate tracking model. For only having four subpar cameras, it does a surprisingly good job at mapping out Greyson's hallway and kitchen.
