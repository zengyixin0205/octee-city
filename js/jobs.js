// Jobs and their questions, shared by the town menu (city.js) and the 3D walk (walk.js). Keep in step with CITY.jobs in cloud/index.js.
export const JOBS = {
  "bank-teller": { b: "bank", title: "Bank teller", prompt: "A customer asks for their money back. What do you do?", right: "Count it twice, then say the bank is closed for money today.", wrong: ["Give them all of it in peanuts", "Ask them to come back next Tuesday, with a form"], prompt2: "A second customer asks for a loan. You say…", right2: "Of course. Interest is paid in peanuts.", wrong2: ["No, the loan is on holiday", "Give them the bank"] },
  "bank-vault": { b: "bank", title: "Vault guard", prompt: "The vault has a sign: DO NOT OPEN. Someone is knocking from inside. What now?", right: "Check the sign is still there, then knock back politely.", wrong: ["Open it. Curiosity pays", "Open it and leave the door open for the interest"], prompt2: "The vault combination is written on a bun. Do you…", right2: "Eat the bun, then check the vault is still there.", wrong2: ["Write it on the vault door", "Give the bun to the customer"] },
  "hall-stamp": { b: "hall", title: "Stamp clerk", prompt: "A form has no box for your name. Where do you stamp it?", right: "Across the middle. The form is now yours.", wrong: ["In the box for the weather", "Nowhere. Stamps are for other forms"] },
  "hall-notes": { b: "hall", title: "Minutes clerk", prompt: "The meeting minutes say 'nothing was decided'. What do you write?", right: "Nothing was decided, and that was the decision.", wrong: ["The meeting was cancelled, so there are no minutes", "A poem about the decision"] },
  "clinic-nurse": { b: "clinic", title: "Nurse on the ward", prompt: "A patient says they have a fever of 'about a fortnight'. Your answer?", right: "Ask them to take a nap and to call back in a fortnight.", wrong: ["Give them a peanut for the fever", "Tell them the fever is fine, it is in the leaflet"] },
  "clinic-pharmacy": { b: "clinic", title: "Pharmacy counter", prompt: "The label says 'twice a day'. The bottle says 'every hour'. Which do you trust?", right: "The bottle. It is closer to the patient.", wrong: ["The label. Labels are older", "Neither. Just shake it"] },
  "fire-hose": { b: "fire", title: "Hose handler", prompt: "The hose is pointed at a bakery that is on fire. Do you…", right: "Turn the hose on the bakery's fire. The bread is fine.", wrong: ["Water the bakery's flowers", "Hand the hose to the cinema, it has a good film on"] },
  "fire-dispatch": { b: "fire", title: "Dispatcher", prompt: "A call comes in: 'there is a fire in the library, it is very quiet'. You send…", right: "Two trucks, one quietly.", wrong: ["A bus with a sign", "Nobody. Libraries are fireproof, the leaflet says so"] },
  "post-parcel": { b: "post", title: "Parcel sorter", prompt: "A parcel is labelled 'to me'. It is addressed to a city that does not exist.", right: "Send it to the harbour. The cranes will decide.", wrong: ["Keep it. It is yours now", "Open it and put the contents in the wrong box"] },
  "post-stamp": { b: "post", title: "Stamp counter", prompt: "A stamp has come out upside down. The postage rule says…", right: "Upside down is also postage. Thirty per cent less.", wrong: ["Stamps must be right way up, or they fly away", "A stamp must be licked twice"] },
  "bakery-assistant": { b: "bakery", title: "Bakery assistant", prompt: "The cake is labelled 'do not eat'. A customer asks for a slice. You say…", right: "It is a no-name cake. Nobody can be sure what it is.", wrong: ["Yes, the label is only a suggestion", "Cut it in half and charge double"] },
  "bakery-till": { b: "bakery", title: "Till operator", prompt: "A bun costs 1 CCT. The customer pays with 3 CCT. Change?", right: "Two buns. They are a gift.", wrong: ["Two buns and a bit of your heart", "You keep the 3 CCT, the bun was free"] },
  "library-shelf": { b: "library", title: "Shelf stacker", prompt: "A book on the shelf is whispering. Your move?", right: "Read it quietly. It is a recipe.", wrong: ["Shout back. Books like that", "Put it in the cinema, it is a film now"] },
  "library-returns": { b: "library", title: "Returns desk", prompt: "A book is four years overdue. The fine is…", right: "Four years of a smile. The library is very kind.", wrong: ["The whole book, in CCT", "Nothing. Overdue books have feelings too"] },
  "cinema-usher": { b: "cinema", title: "Usher", prompt: "The film has no ending. A customer asks where the ending is. You say…", right: "It is in the next film. Tickets are 1 CCT.", wrong: ["The ending is in the bakery", "Sit down, you will see it eventually"] },
  "cinema-projector": { b: "cinema", title: "Projectionist", prompt: "The film is running backwards. Do you…", right: "Leave it. The audience is getting younger.", wrong: ["Turn it round, the audience will complain", "Run the film forwards in the bakery"] },
  "power-switch": { b: "power", title: "Switch operator", prompt: "The town goes dark. The lights in FIA stay on. The correct move is…", right: "Leave FIA lit. The town can be dark, FIA cannot.", wrong: ["Turn FIA off so the town is fair", "Turn the whole sky on"] },
  "power-meter": { b: "power", title: "Meter reader", prompt: "The meter says 'enough'. How much is enough?", right: "Exactly the amount the leaflet says. The leaflet is short.", wrong: ["Whatever the bakery says", "More. Always more"] },
  "radio-dial": { b: "radio", title: "Dial turner", prompt: "The dial is stuck on the same song. What do you do?", right: "Turn it to the song after. It is the same song.", wrong: ["Hit the dial with the bakery", "Sing along, loudly"] },
  "radio-playlist": { b: "radio", title: "Playlist keeper", prompt: "A listener asks for a song that is not on the list. You…", right: "Add it. The list is only a suggestion too.", wrong: ["Play the sorry station instead", "Ask them to come back when the list is longer"] },
  "food-waiter": { b: "food", title: "Waiter", prompt: "A customer asks for 'the usual'. You have never met them. You say…", right: "Of course. The usual is peanuts, in a hat.", wrong: ["Bring them a bun, it is the usual at the bakery", "Ask them what their usual is, then charge for it"] },
  "food-dish": { b: "food", title: "Dish chef", prompt: "The recipe says 'add peanuts until it is right'. When is it right?", right: "When the customer stops asking.", wrong: ["When the bakery says so", "When the hat fits"] },
  "harbour-crane": { b: "harbour", title: "Crane operator", prompt: "A crane lifts a box marked 'do not lift'. You…", right: "Lift it higher. It was rude to say so.", wrong: ["Lower it into the empty harbour", "Lift it to the cinema"] },
  "harbour-dock": { b: "harbour", title: "Dock hand", prompt: "A ship arrives at a harbour with no sea. Where does it dock?", right: "On the car park. Ships love a car park.", wrong: ["In the library", "Back out. It is a plane"] },
  "tax-clerk": { b: "tax", title: "Tax clerk", prompt: "A citizen says their tax is 'whatever the peanuts say'. You…", right: "Ask the peanuts for a receipt.", wrong: ["Accept it. Peanuts are reliable", "Tax them back, twice"] },
  "tax-audit": { b: "tax", title: "Auditor", prompt: "The audit finds 3 CCT missing. Where did it go?", right: "A spot check, probably. Write it down.", wrong: ["In the bakery's bun", "It was never there. Audits do not count air"], prompt2: "The form has one box left. What goes in it?", right2: "The true number, then a second, shorter one.", wrong2: ["Whatever the peanuts say", "A drawing of the bus"] },
  "car-attendant": { b: "car", title: "Car park attendant", prompt: "A car has been in the bus lane for three days. Ticket?", right: "A ticket, and a note that the bus is also parked.", wrong: ["Clamp the bus", "The car is a monument now"] },
  "car-ticket": { b: "car", title: "Ticket machine", prompt: "The machine says 'insert coin' but has no slot. What do you do?", right: "Insert the coin into the machine's opinion.", wrong: ["Shake the machine", "Give up. Parking is a state of mind"] },
  "gym-instructor": { b: "gym", title: "Gym instructor", prompt: "A member asks how many reps to do. You say…", right: "Until the bench gives up first.", wrong: ["Zero. Resting is the workout", "All of them, in one go"] },
  "gym-towel": { b: "gym", title: "Lost property, gym", prompt: "A towel is lost in the sauna. Lost property says…", right: "Check the sauna is not the towel.", wrong: ["The towel is in the cinema", "Towels do not get lost, they go on holiday"] },
  "museum-guide": { b: "museum", title: "Museum guide", prompt: "A visitor asks what the peanut exhibit is. You say…", right: "It is a peanut. Please do not touch it, it is valuable.", wrong: ["It is a bus timetable", "It is the exhibit from the bakery"] },
  "museum-cleaner": { b: "museum", title: "Museum cleaner", prompt: "The exhibit's sign has fallen off. Your move?", right: "Put the sign back, next to the exhibit it describes.", wrong: ["Put the exhibit on the sign", "Sweep the sign into the bakery"] },
  "bus-driver": { b: "bus", title: "Bus driver", prompt: "Passengers ask to go to FIA. The bus goes to the sea. You…", right: "Drive to the sea. FIA is a state of mind.", wrong: ["Turn round politely, FIA is a short walk", "Charge the passengers double for the scenic route"] },
  "bus-timetable": { b: "bus", title: "Timetable keeper", prompt: "The timetable says the next bus is 'soon'. How soon?", right: "Soon is a time. Check the clock.", wrong: ["Exactly as soon as you get here", "It is printed on a bun"] },
  "laundry-attendant": { b: "laundry", title: "Laundry attendant", prompt: "A customer's sock is missing. What do you tell them?", right: "It is in the other machine, which is the machine that is always on fire.", wrong: ["It went to FIA", "It was never a sock, it was a glove"] },
  "lifeguard": { b: "pool", title: "Lifeguard", prompt: "Someone shouts that they cannot swim. What do you do?", right: "Blow the whistle, throw the ring, and say the pool is one metre deep.", wrong: ["Shout that the pool is thirty metres long", "Join them in the deep end for moral support"] },
  "stallholder": { b: "market", title: "Stallholder", prompt: "A customer asks if the lamp is genuine. What do you say?", right: "It is genuine, it is just not the lamp you think it is.", wrong: ["Yes, it is the lamp from the airport", "The lamp is free if you pretend it is not"] },
  "police-patrol": { b: "police", title: "Patrol officer", prompt: "A citizen has already clocked in twice today. What is the offence?", right: "Double shifting. Arrest, fine, and time in the cells.", wrong: ["Overtime. Pay them more", "Nothing. They are just very keen"], prompt2: "The citizen says they only did it for the bun. Next step?", right2: "Write down the bun. The bun is evidence now.", wrong2: ["Give them a second bun", "Let them go, buns are not a crime"] },
  "police-desk": { b: "police", title: "Desk sergeant", prompt: "A suspect asks for a lawyer. What does the desk say?", right: "A lawyer is on the way. The lawyer is also on the way to jail.", wrong: ["Here is a peanut, the matter is closed", "Lawyers are not in the leaflet"], prompt2: "The cells are full. Where does the next suspect wait?", right2: "In the Park. The Park has a bench.", wrong2: ["In the bakery's oven", "They are released with a peanut"] }
};
export const PAY = 10, HARD_PAY = 15;
// Harder jobs pay more. Keep in step with CITY.hard in cloud/index.js.
export const HARD = ["bank-teller", "bank-vault", "tax-audit", "police-patrol", "police-desk"];
export const payOf = (id) => (HARD.includes(id) || (JOBS[id] && JOBS[id].hard) ? HARD_PAY : PAY);
// Extra questions for the built-in jobs. Every job has at least two questions; the hard jobs have three. Each entry: [question, right answer, [wrong, wrong]].
export const EXTRA_STEPS = {
 "bank-teller": [
  [
   "Your deposit slip says 'withdraw everything'. The vault is closed. What do you say?",
   "Check the vault is on the right side of the wall, then offer a biscuit.",
   [
    "Hand over the vault",
    "Ask the customer to come back in a year, with interest"
   ]
  ],
  [
   "A customer wants a better exchange rate, from the till. The rate is the same. You say…",
   "Explain the rate is the same, and that the town keeps the gap.",
   [
    "Give them a better rate from the till",
    "Call the police to make it fair"
   ]
  ]
 ],
 "bank-vault": [
  [
   "The vault combination is written on the wall. The wall is also the vault. What now?",
   "Politely ask the vault to open itself.",
   [
    "Write the combination on a second wall",
    "Tell the knocking inside the combination"
   ]
  ],
  [
   "The next guard asks for the key. The key is inside the vault. You say…",
   "The key is in the vault, which is locked, which is the point.",
   [
    "Lend them the vault",
    "Let the next guard knock"
   ]
  ]
 ],
 "hall-stamp": [
  [
   "A form must be stamped within five days. It arrived in six. Your stamp says…",
   "'Received late, stamped on time.' The stamp insists.",
   [
    "'Approved, retrospectively, by the stamp'",
    "'Rejected, the stamp was on holiday'"
   ]
  ]
 ],
 "hall-notes": [
  [
   "The minutes must record a decision, and the meeting decided nothing. You write…",
   "'It was decided to decide later.'",
   [
    "'The meeting was cancelled.'",
    "'A decision was made, and it was lunch.'"
   ]
  ]
 ],
 "clinic-nurse": [
  [
   "The chart says 'allergic to everything'. Which medicine do you give?",
   "A sugar tablet, with the leaflet read out loud.",
   [
    "The strongest one in the cupboard",
    "Whichever one the patient asks for, loudly"
   ]
  ]
 ],
 "clinic-pharmacy": [
  [
   "The leaflet is in a language nobody reads. The bottle is clearly labelled. Which do you follow?",
   "The bottle, and you ask the patient to read the leaflet back.",
   [
    "The leaflet, because it is longer",
    "Neither, the bottle is probably from the bus"
   ]
  ]
 ],
 "fire-hose": [
  [
   "The bakery fire is out, but the hose is still running. Your next step?",
   "Turn off the hose and offer the bakery a bun.",
   [
    "Aim the hose at the library, just in case",
    "Leave it running, the bakery likes the water"
   ]
  ]
 ],
 "fire-dispatch": [
  [
   "The caller says the fire is 'behind you'. You turn round and see…",
   "Nothing. Log the call as 'a fire behind you, nothing there'.",
   [
    "A fire, which you put out with the phone",
    "The caller, who is also behind you"
   ]
  ]
 ],
 "post-parcel": [
  [
   "The parcel's address is a postcode made of letters only. Where does it go?",
   "Back to the sender, who is also a postcode.",
   [
    "Into the bin marked 'elsewhere'",
    "To FIA, which accepts everything"
   ]
  ]
 ],
 "post-stamp": [
  [
   "Two stamps are stuck together. The postage is paid twice. You…",
   "Cancel one stamp and send the parcel with the other.",
   [
    "Charge the sender twice, for fairness",
    "Post the two stamps as one letter, which is cheating"
   ]
  ]
 ],
 "bakery-assistant": [
  [
   "A customer asks for 'the cake with no name'. Which do you sell?",
   "The one with no name, and an apology.",
   [
    "The one with the name crossed out",
    "Whichever is least stale"
   ]
  ]
 ],
 "bakery-till": [
  [
   "The customer has 1 CCT, wants a 1 CCT bun, and wants change. Your answer?",
   "The bun, and a smile. The change is the smile.",
   [
    "Four buns, for the change",
    "The bun, and the till's own coins, which are peanuts"
   ]
  ]
 ],
 "library-shelf": [
  [
   "A book says 'please be quiet' in capital letters. You…",
   "Shelve it quietly, and apologise to the shelf.",
   [
    "Read it aloud, to be helpful",
    "Put it on the wrong shelf, for variety"
   ]
  ]
 ],
 "library-returns": [
  [
   "A book is returned five years late with a note: 'sorry, the dog ate it'. The fine is…",
   "Half a peanut, and a library card for the dog.",
   [
    "The full price of the dog",
    "Nothing, the dog ate the fine"
   ]
  ]
 ],
 "cinema-usher": [
  [
   "A customer asks for a refund because the film ends in the middle. You…",
   "Explain that the middle is the ending, for now.",
   [
    "Give them the middle of their ticket",
    "Show the film again from the start, as a refund"
   ]
  ]
 ],
 "cinema-projector": [
  [
   "The film has reached the end, but the reels say 'Part 1 of 3'. You…",
   "Rewind to Part 1, and tell the audience it gets better.",
   [
    "Show Part 3 and hope for the best",
    "Play the reels in any order, which is art"
   ]
  ]
 ],
 "power-switch": [
  [
   "A switch says 'do not touch', and it is the only switch. You…",
   "Touch it gently, and write 'touched gently' on the label.",
   [
    "Leave it alone and hope FIA notices",
    "Hit it, which is what the label is for"
   ]
  ]
 ],
 "power-meter": [
  [
   "The meter reads 'enough', and the town needs more. You…",
   "Ask the meter what it means by 'enough', and wait politely.",
   [
    "Turn the meter up to 'lots'",
    "Read the meter with your eyes closed"
   ]
  ]
 ],
 "radio-dial": [
  [
   "The dial is stuck, and the stuck song is now the only song in town. You tell listeners…",
   "It's the best song in town, and it's on repeat, on purpose.",
   [
    "Sorry, then play it backwards",
    "The radio is in the cells"
   ]
  ]
 ],
 "radio-playlist": [
  [
   "A listener asks for a song that was never on the list. You…",
   "Add it to the list, and say it was always there.",
   [
    "Say 'it's not on the list' and hang up",
    "Play the list in alphabetical order of the listener"
   ]
  ]
 ],
 "food-waiter": [
  [
   "A customer orders 'the usual', which is peanuts in a different hat. You bring…",
   "The peanuts, in a hat, and ask how they liked the last one.",
   [
    "A plate with no peanuts, as a surprise",
    "The hat, which the customer already has"
   ]
  ]
 ],
 "food-dish": [
  [
   "The recipe says 'add peanuts until it is right'. The dish is already right. You…",
   "Stop adding peanuts, and taste it again.",
   [
    "Keep adding until the peanuts are right",
    "Add a hat, for presentation"
   ]
  ]
 ],
 "harbour-crane": [
  [
   "A box marked 'do not lift' is lifted. You…",
   "Put it back on the dock, labelled 'lifted, with permission'.",
   [
    "Drop it in the sea, which has none",
    "Keep it on the crane, which is the only thing that can hold it"
   ]
  ]
 ],
 "harbour-dock": [
  [
   "The ship has docked, but the harbour has no sea. The sailors ask where the water is. You say…",
   "It is across the road, in the bakery.",
   [
    "Check the fire station, they have a hose",
    "There is no water, but there is a very good cafe"
   ]
  ]
 ],
 "tax-clerk": [
  [
   "A citizen pays their tax in buns. The tax office takes…",
   "The buns, weighed carefully, and a receipt in bun form.",
   [
    "Nothing, buns are not money",
    "The citizen, as a fine"
   ]
  ]
 ],
 "tax-audit": [
  [
   "The missing 3 CCT was in a bun. Who ate the bun?",
   "The auditor, who is an honest bun.",
   [
    "The citizen, who is a bun",
    "Nobody, buns cannot eat"
   ]
  ],
  [
   "The books balance, but the buns do not. You…",
   "Audit the buns, and report them as a separate department.",
   [
    "Balance the books with more buns",
    "Report the buns to the police"
   ]
  ]
 ],
 "car-attendant": [
  [
   "A car is in the bus lane, and its driver says it is a bus. You…",
   "Ask to see the bus's ticket, then issue the car one.",
   [
    "Let the car drive on, buses are optional",
    "Tow the bus"
   ]
  ]
 ],
 "car-ticket": [
  [
   "The machine takes no coins, but takes buns. Where does the bun go?",
   "In the slot, and the ticket goes to the bun.",
   [
    "In your mouth, the bun was for you",
    "In the bin marked 'coins'"
   ]
  ]
 ],
 "gym-instructor": [
  [
   "A member asks how long to rest between sets. You say…",
   "Rest until you feel brave, then one more.",
   [
    "Rest for a week, then start again",
    "Don't rest, the towel needs the bench"
   ]
  ]
 ],
 "gym-towel": [
  [
   "The towel was found in the sauna, which is now also a towel. Lost property says…",
   "It has been claimed by the sauna. Please see the sauna.",
   [
    "It's yours, if you can carry it",
    "It's lost, which is what we do"
   ]
  ]
 ],
 "museum-guide": [
  [
   "A visitor asks to touch the peanut under glass. You say…",
   "Only through the glass, which is the peanut's privacy.",
   [
    "Yes, it is very valuable and very warm",
    "Yes, but please don't tell the peanut"
   ]
  ]
 ],
 "museum-cleaner": [
  [
   "The peanut has rolled under the case. You…",
   "Ask the peanut to come out, politely, and wait.",
   [
    "Put a bigger case over the first case",
    "Eat it, it is nearly a snack"
   ]
  ]
 ],
 "bus-driver": [
  [
   "A passenger says they are lost. Where do you take them?",
   "To the bus stop, which is always where you start.",
   [
    "To the sea, as before",
    "To the bakery, for buns"
   ]
  ]
 ],
 "bus-timetable": [
  [
   "The timetable says the next bus is 'soon', and the bus is due at 'soon minus one'. You…",
   "Explain that soon is a time too, and print it in bold.",
   [
    "Print 'sooner'",
    "Remove the timetable, which will be soon"
   ]
  ]
 ],
 "laundry-attendant": [
  [
   "The machine is on fire. Which button do you press?",
   "The one that says 'spin', which stops the fire, probably.",
   [
    "The one that says 'fire'",
    "All of them, in order"
   ]
  ]
 ],
 "lifeguard": [
  [
   "The swimmer is now in the shallow end, and is still shouting. You…",
   "Ask if they would like a ring, for their own peace of mind.",
   [
    "Throw them into the deep end",
    "Blow the whistle, which is now the swimmer's fault"
   ]
  ]
 ],
 "stallholder": [
  [
   "A customer offers 1 CCT for a 'lamp of genuine value'. You…",
   "Explain the lamp is 1 CCT, and the value is the lamp.",
   [
    "Sell it, and keep the coin for luck",
    "Put the lamp in the bin marked 'genuine'"
   ]
  ]
 ],
 "police-patrol": [
  [
   "The offender says they were only clocking in for the tea. Do you…",
   "Note the tea as an offence, and bring your own cup.",
   [
    "Arrest the tea",
    "Let them off, the tea was in a hurry"
   ]
  ],
  [
   "A citizen asks you to prove you are a police officer. You show…",
   "Your badge, which says 'police'.",
   [
    "A bun, which is the official sign",
    "Your shift timetable, printed in bold"
   ]
  ]
 ],
 "police-desk": [
  [
   "The lawyer is on the way, and the suspect is on the way out. Where do you seat the suspect?",
   "In the cells, which are waiting.",
   [
    "In the lobby, to make the lawyer comfortable",
    "Next to the bun, for morale"
   ]
  ],
  [
   "The suspect asks what the charge is. The desk says…",
   "'Clocking in twice, which is a crime, and very loudly.'",
   [
    "'Nothing, the charge is in the post'",
    "'Buns'"
   ]
  ]
 ]
};
