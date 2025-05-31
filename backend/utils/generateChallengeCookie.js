

export const generateChallengeCookie = (res,email, userId, challenge) => {

    res.cookie("challengeCookie", JSON.stringify(
        { 
            email,
            userId,
            challenge
        }
    ), 
    {
        httpOnly: true, 
        maxAge: 60000, // 60 seconds
        secure: true
    });

}