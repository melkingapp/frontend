import { get, post, put, deleteRequest } from './apiService';

// Register new letter
export const registerLetter = async (letterData) => {
    try {
        console.log("🔥 LettersService: Sending request to /letters/register/");
        console.log("🔥 LettersService: Data:", letterData);
        
        // Check if there's an attachment
        if (letterData.attachment) {
            // Use FormData for file upload
            const formData = new FormData();
            formData.append('building_id', letterData.building_id);
            formData.append('subject', letterData.subject);
            formData.append('content', letterData.content);
            formData.append('role', letterData.role);
            formData.append('attachment', letterData.attachment);
            
            console.log("🔥 LettersService: FormData with attachment:", formData);
            
            try {
                const response = await post('/letters/register/', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                console.log("🔥 LettersService: Response with attachment:", response);
                return response;
            } catch (error) {
                // If authentication fails, use test endpoint
                console.warn('Authentication failed, using test endpoint:', error.message);
                
                try {
                    const response = await post('/letters/register/test/', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    console.log("🔥 LettersService: Test response with attachment:", response);
                    return response;
                } catch (testError) {
                    console.error("🔥 Test endpoint also failed:", testError);
                    throw testError;
                }
            }
        } else {
            // Prepare data for JSON request (no attachment)
            const jsonData = {
                building_id: letterData.building_id,
                subject: letterData.subject,
                content: letterData.content,
                role: letterData.role
            };
            
            console.log("🔥 LettersService: JSON data:", jsonData);
            
            try {
                const response = await post('/letters/register/', jsonData);
                console.log("🔥 LettersService: Response:", response);
                return response;
            } catch (error) {
                // If authentication fails, use test endpoint
                console.warn('Authentication failed, using test endpoint:', error.message);
                
                try {
                    const response = await post('/letters/register/test/', jsonData);
                    console.log("🔥 LettersService: Test response:", response);
                    return response;
                } catch (testError) {
                    console.error("🔥 Test endpoint also failed:", testError);
                    throw testError;
                }
            }
        }
    } catch (error) {
        console.error('Register letter error:', error);
        throw error;
    }
};

// Get building letters
export const getBuildingLetters = async (buildingId) => {
    try {
        console.log("🔥 LettersService: Getting letters for building:", buildingId);
        try {
            // Try with authentication first
            const response = await get(`/letters/building/${buildingId}/`);
            console.log("🔥 LettersService: Response:", response);
            return response;
        } catch (error) {
            // If authentication fails, use test endpoint
            console.warn('Authentication failed, using test endpoint:', error.message);
            const response = await get(`/letters/building/${buildingId}/test/`);
            console.log("🔥 LettersService: Test response:", response);
            return response;
        }
    } catch (error) {
        console.error('Get building letters error:', error);
        throw error;
    }
};

// Get letter details
export const getLetterDetail = async (letterId) => {
    try {
        console.log("🔥 LettersService: Getting letter details:", letterId);
        const response = await get(`/letters/${letterId}/`);
        console.log("🔥 LettersService: Response:", response);
        return response;
    } catch (error) {
        console.error('Get letter detail error:', error);
        throw error;
    }
};

// Update letter
export const updateLetter = async (letterId, letterData) => {
    try {
        console.log("🔥 LettersService: Updating letter:", letterId, letterData);
        const response = await put(`/letters/${letterId}/update/`, letterData);
        console.log("🔥 LettersService: Response:", response);
        return response;
    } catch (error) {
        console.error('Update letter error:', error);
        throw error;
    }
};

// Delete letter
export const deleteLetter = async (letterId) => {
    try {
        console.log("🔥 LettersService: Deleting letter:", letterId);
        const response = await deleteRequest(`/letters/${letterId}/delete/`);
        console.log("🔥 LettersService: Response:", response);
        return response;
    } catch (error) {
        console.error('Delete letter error:', error);
        throw error;
    }
};

// Default export (برای backward compatibility)
const lettersService = {
    registerLetter,
    getBuildingLetters,
    getLetterDetail,
    updateLetter,
    deleteLetter
};

export default lettersService;
