import api from '../../lib/axios';

// Courses
export const getCourses = () => api.get('/courses').then(r => r.data);
export const createCourse = (data: any) => api.post('/courses', data).then(r => r.data);
export const updateCourse = (id: number, data: any) => api.patch(`/courses/${id}`, data).then(r => r.data);
export const deleteCourse = (id: number) => api.delete(`/courses/${id}`).then(r => r.data);
export const addSubcourse = (courseId: number, data: any) => api.post(`/courses/${courseId}/subcourses`, data).then(r => r.data);
export const updateSubcourse = (id: number, data: any) => api.patch(`/courses/subcourses/${id}`, data).then(r => r.data);
export const deleteSubcourse = (id: number) => api.delete(`/courses/subcourses/${id}`).then(r => r.data);

// Rooms
export const getRooms = () => api.get('/rooms').then(r => r.data);
export const createRoom = (data: any) => api.post('/rooms', data).then(r => r.data);
export const updateRoom = (id: number, data: any) => api.patch(`/rooms/${id}`, data).then(r => r.data);
export const deleteRoom = (id: number) => api.delete(`/rooms/${id}`).then(r => r.data);

// Tags
export const getTags = () => api.get('/tags').then(r => r.data);
export const createTag = (data: any) => api.post('/tags', data).then(r => r.data);
export const updateTag = (id: number, data: any) => api.patch(`/tags/${id}`, data).then(r => r.data);
export const deleteTag = (id: number) => api.delete(`/tags/${id}`).then(r => r.data);

// Holidays
export const getHolidays = () => api.get('/holidays').then(r => r.data);
export const createHoliday = (data: any) => api.post('/holidays', data).then(r => r.data);
export const deleteHoliday = (id: number) => api.delete(`/holidays/${id}`).then(r => r.data);

// Grade Settings
export const getGradeSettings = () => api.get('/grade/settings').then(r => r.data);
export const updateGradeSettings = (data: any) => api.patch('/grade/settings', data).then(r => r.data);

// Exams
export const getExams = (groupId: number) => api.get('/exams', { params: { groupId } }).then(r => r.data);
export const createExam = (data: any) => api.post('/exams', data).then(r => r.data);
export const getExamResults = (id: number) => api.get(`/exams/${id}`).then(r => r.data);
export const submitExamResults = (id: number, results: any) => api.post(`/exams/${id}/results/bulk`, { results }).then(r => r.data);
export const deleteExam = (id: number) => api.delete(`/exams/${id}`).then(r => r.data);

// Forms
export const getForms = () => api.get('/forms').then(r => r.data);
export const createForm = (data: any) => api.post('/forms', data).then(r => r.data);
export const updateForm = (id: number, data: any) => api.patch(`/forms/${id}`, data).then(r => r.data);
export const deleteForm = (id: number) => api.delete(`/forms/${id}`).then(r => r.data);

// Schedule
export const getSchedule = (params?: { dayType?: string }) => api.get('/schedule', { params }).then(r => r.data);

// Online Lessons
export const getOnlineLessons = () => api.get('/online-lessons/upcoming').then(r => r.data);
export const createOnlineLesson = (groupId: number, data: any) => api.post(`/online-lessons/group/${groupId}`, data).then(r => r.data);
export const updateOnlineLesson = (id: number, data: any) => api.patch(`/online-lessons/${id}`, data).then(r => r.data);
export const deleteOnlineLesson = (id: number) => api.delete(`/online-lessons/${id}`).then(r => r.data);

// Discounts
export const getDiscounts = () => api.get('/discounts').then(r => r.data);
export const createDiscount = (groupId: number, data: any) => api.post(`/discounts/group/${groupId}`, data).then(r => r.data);
export const updateDiscount = (id: number, data: any) => api.patch(`/discounts/${id}`, data).then(r => r.data);
export const deleteDiscount = (id: number) => api.delete(`/discounts/${id}`).then(r => r.data);

// Blog
export const getBlogPosts = () => api.get('/blog').then(r => r.data);
export const createBlogPost = (data: any) => api.post('/blog', data).then(r => r.data);
export const updateBlogPost = (id: number, data: any) => api.patch(`/blog/${id}`, data).then(r => r.data);
export const deleteBlogPost = (id: number) => api.delete(`/blog/${id}`).then(r => r.data);
