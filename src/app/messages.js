export default {
    require: (what='')=>{
        return `مقدار ${what} وارد نشده است.`
    },
    error: {
        internal: 'خطا از سوی سرور رخ داده است.',
        notfount: 'صفحه ی مورد نظر یافت نشد.',
        forbiden: 'درسترسی شما مجاز نیست.'
    },
    database: {
        created: 'اطلاعات با موفقیت ثبت شدند.',
        updated: 'اطلاعات با موفقیت ویرایش شدند.',
        removed: 'اطلاعات با موفقیت حذف شدند.'
    },
    model: {
        notexists: 'این دیتابیس وجود ندارد.',
        badmethod: 'این متد پشتیبانی نمی شود.'
    },
    auth: {
        badtoken: 'این توکن اشتباه است.',
        expired: 'این توکن منقضی شده است.',
        badpassword: 'رمزعبور اشتباه است.',
        success: 'شما با موفقیت وارد شدید.',
        notfound: 'حساب کاربری یافت نشد.',
        registerd: 'این ایمیل قبلا ثبت شده است.',
        emailVerified: 'آدرس ایمیل تایید شده است.',
        phoneVerified: 'شماره موبایل تایید شده است.',
        emailSend: 'لینک تایید حساب کاربری به شما ایمیل شد.',
        smsSend: 'کد تایید به شما پیامک شد.',
        changed: 'رمز عبور شما تغییر کرد.',
        new: 'مدیر جدید با موفقیت افزوده شد.',
        nophone: 'شماره موبایل ثبت نشده است.',
        badcode: 'کد تایید وارد شده اشتباه است.',
        expiredcode: 'این کد تایید منقضی شده است.',
        hascode: 'کد تایید قبلی شما هنوز منقضی نشده است.',
        badtype: 'نوع حساب کاربری اشتباه است.'
    },
    ticket: {
        created: 'تیکت جدید با موفقیت ساخته شد.',
        badstatus: 'وضعیت تیکت اشتباه است.',
        notexists: 'این تیکت وجود ندارد.',
        added: 'پیام جدید با موفقیت ثبت شد.',
        closed: 'تیکت بسته شد.'
    },
    bug: {
        submited: 'گزارش خطای نرم افزاری با موفقیت ثبت شد.',
        projectnotfound: 'این پروژه وجود ندارد.'
    },
    chat: {
        created: 'گفتگوی جدید با موفقیت ایجاد شد.'
    }
}