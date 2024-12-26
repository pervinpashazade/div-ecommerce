import { appConfig } from "../consts.js"

const otp6= Math.floor(100000 + Math.random() * 900000)
 const generateExpiryDate = new Date(Date.now() + appConfig.VERIFYEXPIREDIN * 60 * 1000)
export const HelpersUtils =()=>({
    otp6,
    generateExpiryDate

})