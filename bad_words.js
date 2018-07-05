/**
 * Explicit words censored for users and warns admins.
 * Some, even more explicit words are not event accepted by the server and is not indexed here.
 */

// "Base List of Bad Words in English" that google uses.
let bad_words = ["arse", "ass", "asshole", "bastard", "bitch", "boong", "cock", "cocksucker", "coon", "coonnass", "crap", "cunt", "damn", "darn", "dick", "douche", "fag", "faggot", "fuck", "gook", "motherfucker", "piss", "pussy", "shit", "slut", "tits"]


function containesBadWord(comment) {
    for (badWord of bad_words) {
        if(comment.toLowerCase().indexOf(badWord) != -1) return true;
    }
    return false;
}
 
function censorComment(comment) {
    for (badWord of bad_words) {
        var breakPoint = 0;
        while (comment.toLowerCase().indexOf(badWord) != -1) {
            breakPoint++;
            if(breakPoint > 50){
                console.warn("There was a problem with the censor filter, please report this bug via 'Contact me', Thanks!");
                break;
            }
            var index = comment.toLowerCase().indexOf(badWord);
            var censorString = new String();
            for (let i = 1; i < badWord.length; i++) censorString += "*";
            comment = comment.substr(0, index+1) + censorString + comment.substr(index+badWord.length, comment.length);
        }
    }
    return comment;
}

// censorComment("John FUcking Whick!!!")