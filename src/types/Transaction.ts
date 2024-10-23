export interface Transaction {
  amount: string; // 'amount' sebagai string
  created_at: number; // 'created_at' sebagai timestamp (number)
  email: string; // 'email' tetap string
  name: string; // 'name' tetap string
  phone: string; // 'phone' tetap string
  status: string; // 'status' tetap string
  campaignId?: number; // 'campaignId' opsional, tipe number
  updatedAt?: number; // 'updatedAt' opsional, tipe number
}
