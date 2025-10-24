import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    birth_date?: string;
    phone_number?: string;
    role: string;
    account_status: string;
    created_at?: string;
    last_login?: string;
}

@Injectable({providedIn: 'root'})

export class UserService {
    
    private apiUrl = 'http://localhost:3000/api';

    constructor(private http: HttpClient) {}

    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/user`);
    }
    createUser(userData: User): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/user`, userData);
    }


    
    getUsers(queryParams: any = {}): Observable<User[]> {
        const keys = Object.keys(queryParams || {});
        let url = `${this.apiUrl}/user`;
        if (keys.length) {
            const qs = keys.map(k => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`).join('&');
            url += `?${qs}`;
        }
        return this.http.get<User[]>(url);
    }
    // Get current authenticated user (uses protected endpoint /user/me)
    getCurrentUser(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/user/me`);
    }

    // Patch current authenticated user
    patchCurrentUser(payload: Partial<User>): Observable<User> {
        return this.http.patch<User>(`${this.apiUrl}/user/me`, payload);
    }

    getUserById(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/user/${id}`);
    }
    


    // New: fetch users by role (returns array)
    getUsersByRole(role: string): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/user/role/${encodeURIComponent(role)}`);
    }
    
    // get max order info (max_order, first_name, last_name)
    getMaxOrder(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/user/max-order`);
    }
    
    // get recent orders for a user
    getRecentOrders(userId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/user/${userId}/recent-orders`);
    }



    // get all users without filters (calls backend userDAO.Users)


    // get orders count per user
    getOrdersCount(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/user/orders-count`);
    }

    // update account status for a user (e.g., 'blocked' or 'active')
    updateAccountStatus(userId: number | string, account_status: string): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/user/${userId}/status`, { account_status });
    }
    
    updateUserRole(userId: number | string, role: string): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/user/${userId}/role`, { role });
    }

    // delete a user by ID
    deleteUser(userId: number | string, cascade: boolean = false): Observable<any> {
        const qs = cascade ? '?cascade=true' : '';
        return this.http.delete<any>(`${this.apiUrl}/user/${userId}${qs}`);
    }
    
    
    // Get saved addresses for current authenticated user
    getSavedAddresses(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/users/addresses`);
    }

    // Save (create) an address for the authenticated user
    saveAddress(payload: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/users/addresses`, payload);
    }

    // Save (create) an address using the direct endpoint that will create the table if missing
    saveAddressDirect(payload: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/users/addresses/direct`, payload);
    }
    
    // Update an existing address by id for the authenticated user
    updateAddress(id: number | string, payload: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/users/addresses/${id}`, payload);
    }

    // Delete an address by id for the authenticated user
    deleteAddress(id: number | string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/users/addresses/${id}`);
    }
    
}