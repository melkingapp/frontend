import { sanitizeUser } from "../../shared/utils/security";

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // ایجاد نسخه امن شده برای ذخیره در localStorage
        // 1. حذف توکن‌ها (چون در access_token و refresh_token جداگانه ذخیره می‌شوند)
        // 2. پاکسازی اطلاعات کاربر (فقط فیلدهای مجاز ذخیره می‌شوند)
        const safeAuth = {
            ...auth,
            user: sanitizeUser(auth.user),
            tokens: { access: null, refresh: null }
        };

        localStorage.setItem("auth", JSON.stringify(safeAuth));
    }

    return result;
};

export default authMiddleware;
