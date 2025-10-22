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
    getUsers(queryParams: any = {}): Observable<User[]> {
        const keys = Object.keys(queryParams || {});
        let url = `${this.apiUrl}/user`;
        if (keys.length) {
            const qs = keys.map(k => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`).join('&');
            url += `?${qs}`;
        }
        return this.http.get<User[]>(url);
    }
    getUserById(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/user/${id}`);
    }
    

    createUser(userData: User): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/user`, userData);
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
}