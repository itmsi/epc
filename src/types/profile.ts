// Profile Types
export interface ProfileData {
    employee_id: string;
    employee_name: string;
    employee_email: string;
    employee_mobile: string;
    employee_office_number: string;
    employee_address: string;
    employee_foto?: string;
    photo: string;
    title_name: string;
    department_name: string;
    company_name: string;
    // Customer fields
    customer_id?: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    customer_address?: string;
    customer_city?: string;
    customer_state?: string;
    customer_zip?: string;
    customer_country?: string;
    is_customer?: boolean;
    created_at: string;
    updated_at: string;
}

export interface ProfileResponse {
    success: boolean;
    message: string;
    data: ProfileData;
    timestamp: string;
}

export interface UpdateProfileRequest {
    employee_name: string;
    employee_email: string;
    employee_mobile: string;
    employee_office_number: string;
    employee_address: string;
    current_password?: string;
    new_password?: string;
    confirm_password?: string;
}

export interface ProfileFormData {
    employee_name: string;
    employee_email: string;
    employee_mobile: string;
    employee_office_number: string;
    employee_address: string;
    current_password: string;
    new_password: string;
    confirm_password: string;
}