        import { Strategy as GoggleStrategy } from 'passport-google-oauth20';
        import { Strategy as GithubStrategy } from 'passport-github2';
        import passport, { Profile } from 'passport';
        import configKey from '../configs/configkeys';
        import User from '../models/user.model';
        import { SocialLoginEnums, UserRolesEnum } from '../types/constants/common.constant';
        import AppError from '../utils/AppError';
        import HttpStatus from '../types/constants/http-statuscodes';

        try {   
            passport.serializeUser<any,any>((req,user:Express.User, next) => {
                next(null,user._id  )
            })

            passport.deserializeUser(async (id, next) => {
                try {

                    const user = await User.findById(id);
                    if (user) next(null, user);
                    else next(new AppError("User does not exist", HttpStatus.NOT_FOUND), null);
                } catch (error) {
                    next(
                        new AppError(
                            "Something went wrong while deserializing the user. Error: " + error
                            , HttpStatus.INTERNAL_SERVER_ERROR),
                        null
                    );
                }
            
            
            })

            passport.use(new GoggleStrategy({
                clientID: configKey().GOOGLE_CLIENT_ID,
                clientSecret: configKey().GOOGLE_CLIENT_SECRET,
                callbackURL: configKey().GOOGLE_CALLBACK_URL
            }, async (_, __, profile, next) => {

                console.log(profile)
            
                const user = await User.findOne({ email: profile?._json?.email });
                if (user) {
                    if (user?.loginType !== SocialLoginEnums.GOOGLE) {
                        next(new AppError(`you have previously registered using 
                    ${user?.loginType.toLowerCase()}
                . Please use the ${user?.loginType?.toLowerCase()}
                login option to access your account.`, HttpStatus.BAD_REQUEST))
                    } else next(null,user)
                } else {
                
                    const createdUser = await User.create({
                        email: profile?._json.email,
                        password: profile?._json.sub,
                        firstname: profile?._json.given_name,
                        lastname: profile?._json.family_name,
                        isEmailVerified:true,
                        role: UserRolesEnum.USER,
                        avatar: {
                            url: profile._json.picture,
                            localPath: ''
                        },
                        loginType: SocialLoginEnums.GOOGLE
                    })
                    if (createdUser) {
                        next(null, createdUser)
                    } else {
                        next(new AppError("Error while registering the user", HttpStatus.INTERNAL_SERVER_ERROR));
                    }
                }
            
            })) 

            // passport.use(new GithubStrategy({
            //     clientID: configKey().GITHUB_CLIENT_ID,
            //     clientSecret: configKey().GITHUB_CLIENT_SECRET,
            //     callbackURL: configKey().GITHUB_CALLBACK_URL
            // }, async (_: string, __: string, profile: any, next: any) => {
            //     console.log(profile)
            //     const user = await User.findOne({ email: profile?._json.email });
            //     if (user) {
            //         if (user.loginType !== SocialLoginEnums.GITHUB) {
            //             next(new AppError("You have previously registered using " +
            //                 user.loginType?.toLowerCase()?.split("_").join(" ") +
            //                 ". Please use the " +
            //                 user.loginType?.toLowerCase()?.split("_").join(" ") +
            //                 " login option to access your account.", HttpStatus.BAD_REQUEST), null);
            //         } else {
            //             next(null, user);
            //         }
            //     } else {
            //         if (!profile._json.email) {
            //             // next(new AppError( "User does not have a public email associated with their account. Please try another login method",HttpStatus.BAD_REQUEST),null)
            //         } else {
            //             const createdUser = await User.create({
            //                 email: profile._json.email,
            //                 password: profile._json.node_id,
            //                 firstname: profile?.given_name,
            //                 lastname: profile?.family_name,
            //                 isEmailVerified: true,
            //                 role: UserRolesEnum.USER,
            //                 avatar: {
            //                     url: profile._json.picture,
            //                     localPath:""
            //                 },
            //                 loginType: SocialLoginEnums.GITHUB,
            //             })

            //             if (createdUser) {
            //                 next(null,createdUser)
            //             } else {
            //                 next(new AppError("Error while registering the user",HttpStatus.INTERNAL_SERVER_ERROR),null)
            //             }
            //         }
            //     }
            // }))

        } catch (error) {
            console.error("PASSPORT ERROR: ", error);

        }