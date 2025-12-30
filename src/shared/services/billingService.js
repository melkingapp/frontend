import { get, post, put, patch, deleteRequest } from './apiService';

// Register new expense
export const registerExpense = async (expenseData) => {
    try {
        // همیشه از FormData استفاده می‌کنیم (حتی اگر فایلی نداشته باشیم)
        const formData = new FormData();
        
        // بررسی اینکه آیا فایلی وجود دارد
        const hasFile = expenseData.attachment && (
            expenseData.attachment instanceof File || 
            expenseData.attachment instanceof Blob ||
            (typeof expenseData.attachment === 'object' && expenseData.attachment.constructor?.name === 'File')
        );
        
        // ابتدا تمام فیلدهای غیر فایلی را اضافه می‌کنیم
        // این کار باعث می‌شود که فایل در انتهای FormData قرار بگیرد
        for (const key in expenseData) {
            if (expenseData[key] !== undefined && expenseData[key] !== null && key !== 'attachment') {
                // مدیریت آرایه specific_units
                if (key === 'specific_units' && Array.isArray(expenseData[key])) {
                    formData.append(key, JSON.stringify(expenseData[key]));
                }
                // مدیریت custom_unit_costs (اگر object است)
                else if (key === 'custom_unit_costs' && typeof expenseData[key] === 'object' && !Array.isArray(expenseData[key])) {
                    formData.append(key, JSON.stringify(expenseData[key]));
                }
                // مدیریت boolean values - برای Django بهتر است به '1'/'0' تبدیل شود
                else if (typeof expenseData[key] === 'boolean') {
                    formData.append(key, expenseData[key] ? '1' : '0');
                }
                // مدیریت بقیه فیلدها
                else {
                    // تبدیل به string برای اطمینان از صحت ارسال
                    const value = expenseData[key];
                    if (value !== null && value !== undefined) {
                        formData.append(key, String(value));
                    }
                }
            }
        }
        
        // در انتها فایل را اضافه می‌کنیم (این کار ممکن است به Cloudflare کمک کند)
        if (hasFile && expenseData.attachment) {
            const file = expenseData.attachment;
            // بررسی اینکه آیا واقعاً یک فایل است
            if (file instanceof File || file instanceof Blob) {
                // Validation: بررسی اندازه فایل (حداکثر 10MB)
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (file.size > maxSize) {
                    throw new Error(`حجم فایل (${(file.size / 1024 / 1024).toFixed(2)} MB) بیشتر از حد مجاز (10 MB) است`);
                }
                
                // Validation: بررسی نوع فایل
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 
                                   'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                                   'text/plain'];
                const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'txt'];
                
                const fileExtension = file.name?.split('.').pop()?.toLowerCase();
                const isValidType = file.type && allowedTypes.some(type => file.type.toLowerCase().includes(type.split('/')[1]));
                const isValidExtension = fileExtension && allowedExtensions.includes(fileExtension);
                
                if (!isValidType && !isValidExtension) {
                    throw new Error(`نوع فایل نامعتبر است. فایل‌های مجاز: JPG, PNG, PDF, DOC, DOCX, TXT`);
                }
                
                // Validation: بررسی اینکه فایل خالی نباشد
                if (file.size === 0) {
                    throw new Error('فایل انتخاب شده خالی است');
                }
                
                // استفاده از نام فایل یا یک نام پیش‌فرض بر اساس نوع فایل
                const fileName = file.name || (file.type ? `attachment.${file.type.split('/')[1]}` : 'attachment');
                formData.append('attachment', file, fileName);
            } else if (file && typeof file === 'object' && file.constructor?.name === 'File') {
                // برای مواردی که instanceof کار نمی‌کند
                // Validation: بررسی اندازه فایل
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (file.size > maxSize) {
                    throw new Error(`حجم فایل (${(file.size / 1024 / 1024).toFixed(2)} MB) بیشتر از حد مجاز (10 MB) است`);
                }
                
                if (file.size === 0) {
                    throw new Error('فایل انتخاب شده خالی است');
                }
                
                // استفاده از نام فایل یا یک نام پیش‌فرض بر اساس نوع فایل
                const fileName = file.name || (file.type ? `attachment.${file.type.split('/')[1]}` : 'attachment');
                formData.append('attachment', file, fileName);
            }
        }
        
        // بررسی اینکه آیا فایل واقعاً append شده است
        const formDataHasAttachment = formData.has('attachment');
        
        // لاگ برای دیباگ - نمایش تمام فیلدهای FormData
        const formDataEntries = {};
        const formDataKeys = Array.from(formData.keys());
        for (const key of formDataKeys) {
            const value = formData.get(key);
            if (value instanceof File || value instanceof Blob) {
                formDataEntries[key] = {
                    type: 'File',
                    name: value.name,
                    size: value.size,
                    mimeType: value.type
                };
            } else {
                formDataEntries[key] = value;
            }
        }
        
        // محاسبه اندازه تقریبی FormData
        let estimatedSize = 0;
        for (const key of formDataKeys) {
            const value = formData.get(key);
            if (value instanceof File || value instanceof Blob) {
                estimatedSize += value.size;
            } else if (typeof value === 'string') {
                estimatedSize += new Blob([value]).size;
            }
        }
        
        console.log('📤 FormData contents:', {
            hasFile: hasFile,
            formDataHasAttachment: formDataHasAttachment,
            keys: formDataKeys,
            entries: formDataEntries,
            estimatedSize: `${(estimatedSize / 1024 / 1024).toFixed(2)} MB`,
            attachment: expenseData.attachment ? {
                name: expenseData.attachment.name,
                size: expenseData.attachment.size,
                type: expenseData.attachment.type,
                isFile: expenseData.attachment instanceof File
            } : null,
            // نمایش تمام فیلدهای expenseData برای مقایسه
            expenseDataKeys: Object.keys(expenseData),
            expenseDataValues: Object.fromEntries(
                Object.entries(expenseData).map(([k, v]) => [
                    k, 
                    v instanceof File ? { type: 'File', name: v.name, size: v.size } : v
                ])
            )
        });
        
        // بررسی اینکه آیا همه فیلدها معتبر هستند
        const requiredFields = ['building_id', 'expense_type', 'total_amount', 'unit_selection', 'distribution_method', 'role', 'bill_due'];
        const missingFields = requiredFields.filter(field => !formDataKeys.includes(field));
        if (missingFields.length > 0) {
            console.warn('⚠️ Missing required fields in FormData:', missingFields);
        }
        
        // اگر فایل وجود دارد اما append نشده، خطا بده
        if (hasFile && !formDataHasAttachment) {
            console.error('❌ File exists but was not appended to FormData!');
            throw new Error('خطا در آماده‌سازی فایل برای ارسال');
        }
        
        // بذار axios خودش Content-Type رو با boundary مناسب set کنه
        // اگر فایل داریم، timeout بیشتری تنظیم می‌کنیم و maxContentLength و maxBodyLength را افزایش می‌دهیم
        const config = hasFile ? { 
            timeout: 60000, // 60 ثانیه برای فایل‌ها
            maxContentLength: Infinity, // بدون محدودیت برای محتوای پاسخ
            maxBodyLength: Infinity, // بدون محدودیت برای بدنه درخواست
            onUploadProgress: (progressEvent) => {
                // لاگ پیشرفت آپلود (اختیاری)
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`📤 Upload progress: ${percentCompleted}%`);
                }
            }
        } : {};
        
        const response = await post('/billing/register-expense/', formData, config);
        return response;
    } catch (error) {
        console.error('Register expense error:', error);
        
        // بهبود مدیریت خطا و نمایش پیام‌های واضح‌تر
        let errorMessage = 'خطا در ثبت هزینه';
        
        // اگر خطا از validation فایل است، پیام را مستقیماً برگردان
        if (error.message && (
            error.message.includes('حجم فایل') || 
            error.message.includes('نوع فایل') || 
            error.message.includes('خالی است')
        )) {
            error.userMessage = error.message;
            throw error;
        }
        
        // بررسی خطاهای شبکه
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            errorMessage = 'زمان ارسال درخواست به پایان رسید. لطفاً دوباره تلاش کنید.';
        } else if (error.code === 'ERR_NETWORK' || !error.response) {
            errorMessage = 'خطا در ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.';
        }
        // بررسی خطاهای HTTP
        else if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            // بررسی اینکه آیا پاسخ HTML است (مثلاً از Cloudflare)
            const isHtmlResponse = typeof data === 'string' && (
                data.trim().startsWith('<!DOCTYPE') || 
                data.trim().startsWith('<html')
            );
            
            if (isHtmlResponse) {
                errorMessage = 'خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.';
                console.error('❌ Received HTML response instead of JSON. This might be a Cloudflare error or server misconfiguration.');
            } else if (data?.error) {
                // استفاده از پیام خطای بک‌اند
                errorMessage = data.error;
            } else if (status === 400) {
                errorMessage = 'داده‌های ارسالی نامعتبر است. لطفاً تمام فیلدها را بررسی کنید.';
            } else if (status === 413) {
                errorMessage = 'حجم فایل ارسالی بیش از حد مجاز است. لطفاً فایل کوچک‌تری انتخاب کنید.';
            } else if (status === 500) {
                errorMessage = 'خطای داخلی سرور. لطفاً دوباره تلاش کنید.';
            } else {
                errorMessage = `خطا در ثبت هزینه (کد خطا: ${status})`;
            }
        }
        
        // اضافه کردن پیام خطا به error object
        error.userMessage = errorMessage;
        
        // لاگ جزئیات بیشتر برای دیباگ
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            userMessage: errorMessage
        });
        
        throw error;
    }
};

// Register new charge
export const registerCharge = async (chargeData) => {
    try {
        // اگر فایل داریم، باید از FormData استفاده کنیم
        const formData = new FormData();
        
        for (const key in chargeData) {
            if (chargeData[key] !== undefined && chargeData[key] !== null) {
                if (key === 'specific_units' && Array.isArray(chargeData[key])) {
                    // آرایه‌ها رو به JSON تبدیل می‌کنیم
                    formData.append(key, JSON.stringify(chargeData[key]));
                } else if (chargeData[key] instanceof File) {
                    // فایل‌ها رو مستقیماً اضافه می‌کنیم
                    formData.append(key, chargeData[key], chargeData[key].name);
                } else {
                    // بقیه فیلدها رو به صورت عادی اضافه می‌کنیم
                    formData.append(key, chargeData[key]);
                }
            }
        }
        
        // بذار axios خودش Content-Type رو با boundary مناسب set کنه
        const response = await post('/billing/register-charge/', formData);
        return response;
    } catch (error) {
        console.error('Register charge error:', error);
        // نمایش پیام خطای Backend اگر موجود باشد
        if (error.response?.data?.error) {
            console.error('Backend error:', error.response.data.error);
        }
        throw error;
    }
};

// Update expense
export const updateExpense = async (expenseData) => {
    try {
        // همیشه از FormData استفاده می‌کنیم (حتی اگر فایلی نداشته باشیم)
        const formData = new FormData();
        
        // بررسی اینکه آیا فایلی وجود دارد
        const hasFile = expenseData.attachment && (
            expenseData.attachment instanceof File || 
            expenseData.attachment instanceof Blob ||
            (typeof expenseData.attachment === 'object' && expenseData.attachment.constructor?.name === 'File')
        );
        
        for (const key in expenseData) {
            if (expenseData[key] !== undefined && expenseData[key] !== null) {
                // مدیریت فایل attachment
                if (key === 'attachment') {
                    const file = expenseData[key];
                    // بررسی اینکه آیا واقعاً یک فایل است
                    if (file instanceof File || file instanceof Blob) {
                        formData.append('attachment', file, file.name || 'attachment');
                    } else if (file && typeof file === 'object' && file.constructor?.name === 'File') {
                        // برای مواردی که instanceof کار نمی‌کند
                        formData.append('attachment', file, file.name || 'attachment');
                    }
                }
                // مدیریت آرایه specific_units
                else if (key === 'specific_units' && Array.isArray(expenseData[key])) {
                    formData.append(key, JSON.stringify(expenseData[key]));
                }
                // مدیریت custom_unit_costs (اگر object است)
                else if (key === 'custom_unit_costs' && typeof expenseData[key] === 'object' && !Array.isArray(expenseData[key])) {
                    formData.append(key, JSON.stringify(expenseData[key]));
                }
                // مدیریت boolean values
                else if (typeof expenseData[key] === 'boolean') {
                    formData.append(key, expenseData[key] ? 'true' : 'false');
                }
                // مدیریت بقیه فیلدها
                else if (key !== 'attachment') {
                    // تبدیل به string برای اطمینان از صحت ارسال
                    const value = expenseData[key];
                    if (value !== null && value !== undefined) {
                        formData.append(key, String(value));
                    }
                }
            }
        }
        
        // لاگ برای دیباگ (فقط در حالت development)
        if (process.env.NODE_ENV === 'development') {
            console.log('📤 Update Expense FormData contents:', {
                hasFile: hasFile,
                keys: Array.from(formData.keys()),
                attachment: expenseData.attachment ? {
                    name: expenseData.attachment.name,
                    size: expenseData.attachment.size,
                    type: expenseData.attachment.type,
                    isFile: expenseData.attachment instanceof File
                } : null
            });
        }
        
        const response = await put('/billing/update-expense/', formData);
        return response;
    } catch (error) {
        console.error('Update expense error:', error);
        if (error.response?.data?.error) {
            console.error('Backend error:', error.response.data.error);
        }
        throw error;
    }
};

// Delete expense
export const deleteExpense = async (expenseId) => {
    try {
        // ارسال shared_bill_id به عنوان query parameter
        const response = await deleteRequest(`/billing/delete-expense/?shared_bill_id=${expenseId}`);
        return response;
    } catch (error) {
        console.error('Delete expense error:', error);
        throw error;
    }
};

// Get expense allocation
export const getExpenseAllocation = async (sharedBillId) => {
    try {
        const response = await get(`/billing/get-expense-allocation/?shared_bill_id=${sharedBillId}`);
        return response;
    } catch (error) {
        console.error('Get expense allocation error:', error);
        throw error;
    }
};

// Pay bill
export const payBill = async (paymentData) => {
    try {
        const response = await post('/billing/pay-bill/', paymentData);
        return response;
    } catch (error) {
        console.error('Pay bill error:', error);
        throw error;
    }
};

// Get financial summary
export const getFinancialSummary = async (buildingId = null, expenseType = null) => {
    try {
        let params = [];
        if (buildingId) params.push(`building_id=${buildingId}`);
        if (expenseType) params.push(`expense_type=${expenseType}`);
        const queryString = params.length > 0 ? `?${params.join('&')}` : '';
        
        const response = await get(`/billing/financial-summary/${queryString}`);
        return response;
    } catch (error) {
        console.error('Get financial summary error:', error);
        throw error;
    }
};

// Get transactions
export const getTransactions = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await get(`/billing/transactions/${queryString}`);
        return response;
    } catch (error) {
        console.error('Get transactions error:', error);
        throw error;
    }
};

// Get transaction details
export const getTransactionDetails = async (transactionId) => {
    try {
        const response = await get(`/billing/transactions/${transactionId}/`);
        return response;
    } catch (error) {
        console.error('Get transaction details error:', error);
        throw error;
    }
};

// Get expense types
export const getExpenseTypes = async () => {
    try {
        const response = await get('/billing/expense-types/');
        return response;
    } catch (error) {
        console.error('Get expense types error:', error);
        throw error;
    }
};

// Upload expense attachment
export const uploadExpenseAttachment = async (expenseId, file) => {
    try {
        const formData = new FormData();
        formData.append('attachment', file);
        
        const response = await post(`/billing/expenses/${expenseId}/attachment/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error) {
        console.error('Upload expense attachment error:', error);
        throw error;
    }
};

// Get pending payments
export const getPendingPayments = async (buildingId = null, status = 'pending') => {
    try {
        const params = new URLSearchParams();
        if (buildingId) params.append('building_id', buildingId);
        if (status) params.append('status', status);
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        
        try {
            // Try with authentication first
            const response = await get(`/billing/pending-payments/${queryString}`);
            return response;
        } catch (error) {
            // If authentication fails, use test endpoint
            console.warn('Authentication failed, using test endpoint:', error.message);
            const response = await get(`/billing/pending-payments-test/${queryString}`);
            return response;
        }
    } catch (error) {
        console.error('Get pending payments error:', error);
        throw error;
    }
};

// Approve payment
export const approvePayment = async (paymentId) => {
    try {
        const response = await post('/billing/approve-payment/', { payment_id: paymentId });
        return response;
    } catch (error) {
        console.error('Approve payment error:', error);
        throw error;
    }
};

// Reject payment
export const rejectPayment = async (paymentId, reason = '') => {
    try {
        const response = await post('/billing/reject-payment/', { 
            payment_id: paymentId, 
            reason 
        });
        return response;
    } catch (error) {
        console.error('Reject payment error:', error);
        throw error;
    }
};

// Validate payments
export const validatePayments = async (paymentIds, buildingId = null) => {
    try {
        const response = await post('/billing/validate-payments/', {
            payment_ids: paymentIds,
            building_id: buildingId
        });
        return response;
    } catch (error) {
        console.error('Validate payments error:', error);
        throw error;
    }
};

// Inquire bill
export const inquireBill = async (billId, paymentId) => {
    try {
        const response = await post('/billing/inquire-bill/', {
            bill_id: billId,
            payment_id: paymentId
        });
        return response;
    } catch (error) {
        console.error('Inquire bill error:', error);
        throw error;
    }
};

// Building Balance Methods
export const getBuildingBalance = async (buildingId, filters = {}) => {
    try {
        const params = new URLSearchParams();
        params.append('building_id', buildingId);
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });
        
        const queryString = params.toString();
        const response = await get(`/billing/building-balance/?${queryString}`);
        return response;
    } catch (error) {
        console.error('Get building balance error:', error);
        throw error;
    }
};

export const getBalanceTransactions = async (buildingId, filters = {}) => {
    try {
        const params = new URLSearchParams();
        params.append('building_id', buildingId);
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });
        
        const queryString = params.toString();
        const response = await get(`/billing/balance-transactions/?${queryString}`);
        return response;
    } catch (error) {
        console.error('Get balance transactions error:', error);
        throw error;
    }
};

export const addBalanceTransaction = async (transactionData) => {
    try {
        const response = await post('/billing/balance-transactions/', transactionData);
        return response;
    } catch (error) {
        console.error('Add balance transaction error:', error);
        throw error;
    }
};

export const updateBalanceTransaction = async (transactionId, transactionData) => {
    try {
        const response = await put(`/billing/balance-transactions/${transactionId}/update/`, transactionData);
        return response;
    } catch (error) {
        console.error('Update balance transaction error:', error);
        throw error;
    }
};

export const deleteBalanceTransaction = async (transactionId) => {
    try {
        const response = await deleteRequest(`/billing/balance-transactions/${transactionId}/delete/`);
        return response;
    } catch (error) {
        console.error('Delete balance transaction error:', error);
        throw error;
    }
};

export const getBalanceTransactionDetails = async (transactionId) => {
    try {
        const response = await get(`/billing/balance-transactions/${transactionId}/`);
        return response;
    } catch (error) {
        console.error('Get balance transaction details error:', error);
        throw error;
    }
};

export const exportBalanceData = async (buildingId, filters = {}) => {
    try {
        const params = new URLSearchParams();
        params.append('building_id', buildingId);
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });
        
        const queryString = params.toString();
        const response = await get(`/billing/export-balance/?${queryString}`, {
            responseType: 'blob'
        });
        return response;
    } catch (error) {
        console.error('Export balance data error:', error);
        throw error;
    }
};

export const getCurrentFundBalance = async (buildingId) => {
    try {
        const response = await get(`/billing/current-fund-balance/?building_id=${buildingId}`);
        return response;
    } catch (error) {
        console.error('Get current fund balance error:', error);
        throw error;
    }
};

// Balance Sheet Methods
export const getBalanceSheet = async (buildingId, filters = {}) => {
    try {
        const params = new URLSearchParams();
        params.append('building_id', buildingId);
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });
        
        const queryString = params.toString();
        const response = await get(`/billing/balance-sheet/?${queryString}`);
        return response;
    } catch (error) {
        console.error('Get balance sheet error:', error);
        throw error;
    }
};

export const exportBalanceSheet = async (buildingId, filters = {}) => {
    try {
        const params = new URLSearchParams();
        params.append('building_id', buildingId);
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });
        
        const queryString = params.toString();
        const response = await get(`/billing/balance-sheet/export/?${queryString}`, {
            responseType: 'blob'
        });
        return response;
    } catch (error) {
        console.error('Export balance sheet error:', error);
        throw error;
    }
};

// Get building units debt credit summary
export const getBuildingUnitsDebtCreditSummary = async (buildingId) => {
    try {
        const response = await get(`/billing/building-units-debt-credit-summary/?building_id=${buildingId}`);
        return response;
    } catch (error) {
        console.error('Get building units debt credit summary error:', error);
        throw error;
    }
};

// Get unit debt summary (single unit)
export const getUnitDebtSummary = async (unitId) => {
    try {
        const response = await get(`/billing/unit-debt/${unitId}/`);
        return response;
    } catch (error) {
        console.error('Get unit debt summary error:', error);
        throw error;
    }
};

// Building Visibility Settings
export const getBuildingVisibilitySettings = async (buildingId) => {
    try {
        const response = await get(`/billing/visibility-settings/?building_id=${buildingId}`);
        return response;
    } catch (error) {
        console.error('Get building visibility settings error:', error);
        throw error;
    }
};

export const toggleDebtCreditVisibility = async (buildingId, showToResidents) => {
    try {
        const payload = {
            building_id: buildingId,
            show_to_residents: showToResidents,
        };
        const response = await post('/billing/toggle-debt-credit-visibility/', payload);
        return response;
    } catch (error) {
        console.error('Toggle debt/credit visibility error:', error);
        throw error;
    }
};

// Extra Payment Request Functions
export const createExtraPaymentRequest = async (buildingId, data) => {
    try {
        const formData = new FormData();
        
        // تبدیل buildingId به number برای اطمینان
        const buildingIdNum = typeof buildingId === 'number' ? buildingId : parseInt(buildingId);
        if (isNaN(buildingIdNum)) {
            throw new Error('building_id باید یک عدد معتبر باشد');
        }
        
        // افزودن فیلدهای الزامی
        formData.append('building_id', buildingIdNum);
        formData.append('title', data.title);
        formData.append('amount', data.amount);
        
        // فیلدهای اختیاری
        if (data.unit_id) {
            formData.append('unit_id', data.unit_id);
        }
        if (data.description) {
            formData.append('description', data.description);
        }
        if (data.payment_date) {
            formData.append('payment_date', data.payment_date);
        }
        
        // مدیریت فایل attachment - منطق یکسان با registerExpense
        if (data.attachment) {
            const file = data.attachment;
            // بررسی اینکه آیا واقعاً یک فایل است
            if (file instanceof File || file instanceof Blob) {
                // Validation: بررسی اندازه فایل (حداکثر 10MB)
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (file.size > maxSize) {
                    throw new Error(`حجم فایل (${(file.size / 1024 / 1024).toFixed(2)} MB) بیشتر از حد مجاز (10 MB) است`);
                }
                
                // Validation: بررسی نوع فایل
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 
                                   'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                                   'text/plain'];
                const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'txt'];
                
                const fileExtension = file.name?.split('.').pop()?.toLowerCase();
                const isValidType = file.type && allowedTypes.some(type => file.type.toLowerCase().includes(type.split('/')[1]));
                const isValidExtension = fileExtension && allowedExtensions.includes(fileExtension);
                
                if (!isValidType && !isValidExtension) {
                    throw new Error(`نوع فایل نامعتبر است. فایل‌های مجاز: JPG, PNG, PDF, DOC, DOCX, TXT`);
                }
                
                // Validation: بررسی اینکه فایل خالی نباشد
                if (file.size === 0) {
                    throw new Error('فایل انتخاب شده خالی است');
                }
                
                // استفاده از نام فایل یا یک نام پیش‌فرض بر اساس نوع فایل
                const fileName = file.name || (file.type ? `attachment.${file.type.split('/')[1]}` : 'attachment');
                formData.append('attachment', file, fileName);
            } else if (file && typeof file === 'object' && file.constructor?.name === 'File') {
                // برای مواردی که instanceof کار نمی‌کند
                // Validation: بررسی اندازه فایل
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (file.size > maxSize) {
                    throw new Error(`حجم فایل (${(file.size / 1024 / 1024).toFixed(2)} MB) بیشتر از حد مجاز (10 MB) است`);
                }
                
                if (file.size === 0) {
                    throw new Error('فایل انتخاب شده خالی است');
                }
                
                // استفاده از نام فایل یا یک نام پیش‌فرض بر اساس نوع فایل
                const fileName = file.name || (file.type ? `attachment.${file.type.split('/')[1]}` : 'attachment');
                formData.append('attachment', file, fileName);
            }
        }
        
        const response = await post('/billing/extra-payment-request/', formData);
        return response;
    } catch (error) {
        console.error('Create extra payment request error:', error);
        throw error;
    }
};

export const getExtraPaymentRequests = async (buildingId, filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (buildingId) {
            params.append('building_id', buildingId);
        }
        if (filters.status) {
            params.append('status', filters.status);
        }
        
        const queryString = params.toString();
        const response = await get(`/billing/extra-payment-requests/${queryString ? `?${queryString}` : ''}`);
        return response;
    } catch (error) {
        console.error('Get extra payment requests error:', error);
        throw error;
    }
};

export const approveExtraPaymentRequest = async (requestId) => {
    try {
        const response = await patch(`/billing/extra-payment-request/${requestId}/approve/`, {});
        return response;
    } catch (error) {
        console.error('Approve extra payment request error:', error);
        throw error;
    }
};

export const rejectExtraPaymentRequest = async (requestId, reason = '') => {
    try {
        const response = await patch(`/billing/extra-payment-request/${requestId}/reject/`, {
            rejection_reason: reason
        });
        return response;
    } catch (error) {
        console.error('Reject extra payment request error:', error);
        throw error;
    }
};

export const toggleFinancialTransactionsVisibility = async (buildingId, showToResidents) => {
    try {
        const payload = {
            building_id: buildingId,
            show_to_residents: showToResidents,
        };
        const response = await post('/billing/toggle-financial-transactions-visibility/', payload);
        return response;
    } catch (error) {
        console.error('Toggle financial transactions visibility error:', error);
        throw error;
    }
};

// Charge Formulas APIs
// Get list of charge formulas for a building
export const getChargeFormulas = async (buildingId) => {
    try {
        const response = await get(`/billing/formulas/?building_id=${buildingId}`);
        return response;
    } catch (error) {
        console.error('Get charge formulas error:', error);
        throw error;
    }
};

// Create a new charge formula
export const createChargeFormula = async (formulaData) => {
    try {
        const response = await post('/billing/formulas/create/', formulaData);
        return response;
    } catch (error) {
        console.error('Create charge formula error:', error);
        if (error.response?.data?.error) {
            console.error('Backend error:', error.response.data.error);
        }
        throw error;
    }
};

// Get charge formula details
export const getChargeFormula = async (formulaId) => {
    try {
        const response = await get(`/billing/formulas/${formulaId}/`);
        return response;
    } catch (error) {
        console.error('Get charge formula error:', error);
        throw error;
    }
};

// Update charge formula
export const updateChargeFormula = async (formulaId, formulaData) => {
    try {
        const response = await put(`/billing/formulas/${formulaId}/`, formulaData);
        return response;
    } catch (error) {
        console.error('Update charge formula error:', error);
        if (error.response?.data?.error) {
            console.error('Backend error:', error.response.data.error);
        }
        throw error;
    }
};

// Delete charge formula
export const deleteChargeFormula = async (formulaId) => {
    try {
        const response = await deleteRequest(`/billing/formulas/${formulaId}/`);
        return response;
    } catch (error) {
        console.error('Delete charge formula error:', error);
        throw error;
    }
};

// Announce charge (new endpoint with auto_schedule support)
export const announceCharge = async (chargeData) => {
    try {
        const response = await post('/billing/announce-charge/', chargeData);
        return response;
    } catch (error) {
        console.error('Announce charge error:', error);
        if (error.response?.data?.error) {
            console.error('Backend error:', error.response.data.error);
        }
        throw error;
    }
};

// Charge Schedule Management APIs
// Get list of charge schedules
export const getChargeSchedules = async (buildingId = null, isActive = null) => {
    try {
        const params = new URLSearchParams();
        if (buildingId) params.append('building_id', buildingId);
        if (isActive !== null) params.append('is_active', isActive);
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await get(`/billing/schedules/${queryString}`);
        return response;
    } catch (error) {
        console.error('Get charge schedules error:', error);
        throw error;
    }
};

// Get charge schedule details
export const getChargeSchedule = async (scheduleId) => {
    try {
        const response = await get(`/billing/schedules/${scheduleId}/`);
        return response;
    } catch (error) {
        console.error('Get charge schedule error:', error);
        throw error;
    }
};

// Toggle schedule (activate/deactivate)
export const toggleChargeSchedule = async (scheduleId) => {
    try {
        const response = await post(`/billing/schedules/${scheduleId}/toggle/`);
        return response;
    } catch (error) {
        console.error('Toggle charge schedule error:', error);
        throw error;
    }
};

// Execute schedule manually
export const executeChargeSchedule = async (scheduleId) => {
    try {
        const response = await post(`/billing/schedules/${scheduleId}/execute/`);
        return response;
    } catch (error) {
        console.error('Execute charge schedule error:', error);
        throw error;
    }
};

// Delete schedule
export const deleteChargeSchedule = async (scheduleId) => {
    try {
        const response = await deleteRequest(`/billing/schedules/${scheduleId}/`);
        return response;
    } catch (error) {
        console.error('Delete charge schedule error:', error);
        throw error;
    }
};

// Default export (برای backward compatibility)
const billingService = {
    registerExpense,
    registerCharge,
    payBill,
    getFinancialSummary,
    getTransactions,
    getTransactionDetails,
    getExpenseTypes,
    uploadExpenseAttachment,
    getPendingPayments,
    approvePayment,
    rejectPayment,
    validatePayments,
    inquireBill,
    getBuildingBalance,
    getBalanceTransactions,
    addBalanceTransaction,
    updateBalanceTransaction,
    deleteBalanceTransaction,
    getBalanceTransactionDetails,
    exportBalanceData,
    getCurrentFundBalance,
    getBalanceSheet,
    exportBalanceSheet,
    getChargeFormulas,
    createChargeFormula,
    getChargeFormula,
    updateChargeFormula,
    deleteChargeFormula,
    announceCharge,
    getChargeSchedules,
    getChargeSchedule,
    toggleChargeSchedule,
    executeChargeSchedule,
    deleteChargeSchedule,
    createExtraPaymentRequest,
    getExtraPaymentRequests,
    approveExtraPaymentRequest,
    rejectExtraPaymentRequest
};

export default billingService;
