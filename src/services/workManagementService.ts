import axios from 'axios';
import { getProxyAuthToken } from '../utils/auth';

export interface Assignee {
  id: number;
  name: string;
  email?: string;
}

export interface WorkItem {
  id: number;
  orgId: number;
  externalId: string | null;
  categoryId: string | null;
  title: string;
  description: string;
  statusGroup: 'CAPTURED' | 'ARCHIVED' | 'CLOSED' | 'IN_PROGRESS' | 'IN_REVIEW';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | null;
  assigneeId: number | null;
  assignee?: Assignee;
  createdBy: number;
  updatedBy: number;
  startDate: string | null;
  dueDate: string | null;
  parentId: string | null;
  rootParentId: string | null;
  docId: string | null;
  createdAt: string;
  updatedAt: string;
  statusId: string | null;
  category: string | null;
}

export interface Category {
  id: number;
  orgId: number;
  keyName: string;
  externalTool: string;
  name: string;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
  customFields: any[];
  statuses: any[];
}

export interface View {
  id: number;
  orgId: number;
  createdBy: number;
  updatedBy: number;
  name: string;
  description: string;
  command: string;
  query: any;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: number;
  orgId: number;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkManagementResponse<T> {
  success: boolean;
  data: T;
}

const WORK_MANAGEMENT_API = 'https://work-management-backend-1091285226236.asia-south1.run.app';

const getHeaders = async () => {
  const token = await getProxyAuthToken();
  return {
    'accept': 'application/json',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7',
    'cache-control': 'no-cache',
    'content-type': 'application/json',
    'origin': 'https://work.50agents.com',
    'pragma': 'no-cache',
    'priority': 'u=1, i',
    'proxy_auth_token': token || '',
    'referer': 'https://work.50agents.com/',
    'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
  };
};

export const workManagementService = {
  async getWorkItems(): Promise<WorkItem[]> {
    try {

      const headers = await getHeaders();
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/work-items`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: WorkManagementResponse<WorkItem[]> = await response.json();
      
      if (data.success) {
        
        return data.data;
      } else {
        throw new Error('API returned success: false');
      }
    } catch (error) {
      console.error('❌ Error fetching work items:', error);
      throw error;
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      console.log('📂 Fetching categories...');
      const headers = await getHeaders();
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/categories`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: WorkManagementResponse<Category[]> = await response.json();
      
      if (data.success) {
        console.log(`✅ Fetched ${data.data.length} categories`);
        return data.data;
      } else {
        throw new Error('API returned success: false');
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      throw error;
    }
  },

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'CAPTURED': '#64748b',
      'ARCHIVED': '#10b981',
      'CLOSED': '#06b6d4',
      'IN_PROGRESS': '#f59e0b',
      'IN_REVIEW': '#8b5cf6',
    };
    return statusColors[status] || '#64748b';
  },

  getPriorityColor(priority: string | null): string {
    const priorityColors: { [key: string]: string } = {
      'LOW': '#64748b',
      'MEDIUM': '#f59e0b',
      'HIGH': '#ef4444',
      'URGENT': '#dc2626',
    };
    return priority ? priorityColors[priority] || '#64748b' : '#64748b';
  },

  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  },

  async updateWorkItemStatus(workItemId: number, statusGroup: string): Promise<void> {
    try {
      console.log(`🔄 Updating work item ${workItemId} status to ${statusGroup}...`);
      const headers = await getHeaders();
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/work-items/${workItemId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ statusGroup }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      console.log(`✅ Status updated successfully`);
    } catch (error) {
      console.error('❌ Error updating work item status:', error);
      throw error;
    }
  },

  async updateWorkItemPriority(workItemId: number, priority: string): Promise<void> {
    try {
      console.log(`🔄 Updating work item ${workItemId} priority to ${priority}...`);
      const headers = await getHeaders();
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/work-items/${workItemId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ priority }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      console.log(`✅ Priority updated successfully`);
    } catch (error) {
      console.error('❌ Error updating work item priority:', error);
      throw error;
    }
  },

  async updateWorkItemDueDate(workItemId: number, dueDate: string): Promise<void> {
    try {
      console.log(`🔄 Updating work item ${workItemId} due date to ${dueDate}...`);
      const headers = await getHeaders();
      
      const payload = { dueDate };
      console.log(`📤 Sending payload:`, JSON.stringify(payload));
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/work-items/${workItemId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log(`📥 Response status: ${response.status}, body:`, responseText);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${responseText}`);
      }

      console.log(`✅ Due date updated successfully`);
    } catch (error) {
      console.error('❌ Error updating work item due date:', error);
      throw error;
    }
  },

  async updateWorkItemFullData(workItemId: number, data: { title?: string; description?: string; categoryId?: string; statusId?: any; statusGroup?: string }): Promise<WorkItem> {
    try {
      console.log(`🔄 Updating work item ${workItemId}...`);
      const headers = await getHeaders();
      
      const token = headers['proxy_auth_token'];
      console.log(`📋 Token status:`, token ? `Present (${token.length} chars)` : 'MISSING - This will cause 404!');
      console.log(`📋 Headers being sent:`, {
        'proxy_auth_token': token ? token.substring(0, 20) + '...' : 'MISSING',
        'content-type': headers['content-type'],
      });
      
      if (!token) {
        console.log(`⚠️ WARNING: proxy_auth_token is missing! The API will return 404.`);
        console.log(`⚠️ Make sure you are logged in and the token is saved in AsyncStorage.`);
      }
      
      const payload = data;
      console.log(`📤 Sending payload:`, JSON.stringify(payload));
      console.log(`🔗 API URL: ${WORK_MANAGEMENT_API}/work-items/${workItemId}`);
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/work-items/${workItemId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });

      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`📥 Error response: ${errorText}`);
        console.log(`❌ API call failed - Status: ${response.status}, URL: ${WORK_MANAGEMENT_API}/work-items/${workItemId}/full-data`);
        if (response.status === 404) {
          console.log(`⚠️ 404 Error: This usually means the proxy_auth_token is missing or invalid.`);
        }
        throw new Error(`API error: ${response.status}`);
      }

      const responseData: WorkManagementResponse<WorkItem> = await response.json();
      
      if (responseData.success) {
        console.log(`✅ Work item updated successfully`);
        return responseData.data;
      } else {
        throw new Error('API returned success: false');
      }
    } catch (error) {
      console.error('❌ Error updating work item:', error);
      throw error;
    }
  },

  async getComments(workItemId: number): Promise<any[]> {
    try {
      console.log(`📥 Fetching comments for work item ${workItemId}...`);
      const headers = await getHeaders();
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/work-items/${workItemId}/comments`, {
        method: 'GET',
        headers,
      });

      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`📥 Error response: ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }

      const responseData: any = await response.json();
      
      if (responseData.success) {
        console.log(`✅ Comments fetched successfully`);
        return responseData.data || [];
      } else {
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
      return [];
    }
  },

  async addComment(workItemId: number, content: string): Promise<any> {
    try {
      console.log(`💬 Adding comment to work item ${workItemId}...`);
      const headers = await getHeaders();
      
      const payload = { content };
      console.log(`📤 Sending comment:`, JSON.stringify(payload));
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/work-items/${workItemId}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`📥 Error response: ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }

      const responseData: any = await response.json();
      
      if (responseData.success) {
        console.log(`✅ Comment added successfully`);
        return responseData.data;
      } else {
        throw new Error('API returned success: false');
      }
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      throw error;
    }
  },

  async editComment(commentId: number, content: string): Promise<any> {
    try {
      console.log(`✏️ Editing comment ${commentId}...`);
      const headers = await getHeaders();
      
      const payload = { content };
      console.log(`📤 Sending updated content:`, JSON.stringify(payload));
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/comments/${commentId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });

      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`📥 Error response: ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }

      const responseData: any = await response.json();
      
      if (responseData.success) {
        console.log(`✅ Comment edited successfully`);
        return responseData.data;
      } else {
        throw new Error('API returned success: false');
      }
    } catch (error) {
      console.error('❌ Error editing comment:', error);
      throw error;
    }
  },

  async deleteComment(commentId: number): Promise<void> {
    try {
      console.log(`🗑️ Deleting comment ${commentId}...`);
      const headers = await getHeaders();
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/comments/${commentId}`, {
        method: 'DELETE',
        headers,
      });

      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`📥 Error response: ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }

      const responseData: any = await response.json();
      
      if (responseData.success) {
        console.log(`✅ Comment deleted successfully`);
      } else {
        throw new Error('API returned success: false');
      }
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      throw error;
    }
  },

  async createWorkItem(data: {
    title: string;
    description?: string;
    categoryId?: string;
    statusGroup?: string;
    priority?: string;
    dueDate?: string;
    parentId?: string;
  }): Promise<WorkItem> {
    try {
      console.log(`🔄 Creating work item...`);
      const headers = await getHeaders();
      
      const payload: any = {
        title: data.title,
        description: data.description || '',
        categoryId: data.categoryId || null,
        statusGroup: data.statusGroup || 'CAPTURED',
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate || null,
      };

      if (data.parentId) {
        payload.parentId = data.parentId;
      }
      
      console.log(`📤 Sending payload:`, JSON.stringify(payload));
      console.log(`🔗 API URL: ${WORK_MANAGEMENT_API}/work-items`);
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/work-items`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`📥 Error response: ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }

      const responseData: WorkManagementResponse<WorkItem> = await response.json();
      
      if (responseData.success) {
        console.log(`✅ Work item created successfully`);
        return responseData.data;
      } else {
        throw new Error('API returned success: false');
      }
    } catch (error) {
      console.error('❌ Error creating work item:', error);
      throw error;
    }
  },

  async deleteWorkItem(workItemId: number): Promise<void> {
    try {
      const headers = await getHeaders();
      
      const response = await fetch(
        `${WORK_MANAGEMENT_API}/work-items/${workItemId}`,
        {
          method: 'DELETE',
          headers,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`❌ Delete failed - Status: ${response.status}`, errorData);
        throw new Error(`API error: ${response.status}`);
      }

      const responseData: WorkManagementResponse<{ message: string }> = await response.json();
      
      if (responseData.success) {
        console.log(`✅ Work item deleted successfully`);
      } else {
        throw new Error('API returned success: false');
      }
    } catch (error) {
      console.error('❌ Error deleting work item:', error);
      throw error;
    }
  },

  async createCategory(data: {
    name: string;
    keyName?: string;
    externalTool?: string;
  }): Promise<Category> {
    try {
      console.log(`📂 Creating category: ${data.name}...`);
      const headers = await getHeaders();
      
      const payload = {
        name: data.name,
        keyName: data.keyName || data.name.toLowerCase().replace(/\s+/g, '_'),
        externalTool: data.externalTool || '',
      };
      
      console.log(`📤 Sending payload:`, JSON.stringify(payload));
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/categories`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`📥 Error response: ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }

      const responseData: WorkManagementResponse<Category> = await response.json();
      
      if (responseData.success) {
        console.log(`✅ Category created successfully:`, responseData.data);
        return responseData.data;
      } else {
        throw new Error('API returned success: false');
      }
    } catch (error) {
      console.error('❌ Error creating category:', error);
      throw error;
    }
  },

  async deleteCategory(categoryId: number): Promise<void> {
    try {
      console.log(`🗑️ Deleting category ${categoryId}...`);
      const headers = await getHeaders();
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/categories/${categoryId}`, {
        method: 'DELETE',
        headers,
      });

      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`📥 Error response: ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }

      const responseData: any = await response.json();
      
      if (responseData.success) {
        console.log(`✅ Category deleted successfully`);
      } else {
        throw new Error('API returned success: false');
      }
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      throw error;
    }
  },

  async getViews(): Promise<View[]> {
    try {
      console.log('📥 Fetching views...');
      const headers = await getHeaders();
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/views`, {
        method: 'GET',
        headers,
      });

      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`📥 Error response: ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }

      const responseData: WorkManagementResponse<View[]> = await response.json();
      
      if (responseData.success && Array.isArray(responseData.data)) {
        console.log(`✅ Views fetched successfully:`, responseData.data);
        return responseData.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching views:', error);
      throw error;
    }
  },

  async createView(viewData: { name: string; description: string; command: string }): Promise<View> {
    try {
      console.log('📤 Creating view...', viewData);
      const headers = await getHeaders();
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/views`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: viewData.name,
          description: viewData.description,
          command: viewData.command,
        }),
      });

      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`📥 Error response: ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }

      const responseData: WorkManagementResponse<View> = await response.json();
      
      if (responseData.success && responseData.data) {
        console.log(`✅ View created successfully:`, responseData.data);
        return responseData.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error creating view:', error);
      throw error;
    }
  },

  async deleteView(viewId: number): Promise<void> {
    try {
      console.log(`🗑️ Deleting view ${viewId}...`);
      const headers = await getHeaders();
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/views/${viewId}`, {
        method: 'DELETE',
        headers,
      });

      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`📥 Error response: ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }

      const responseData: any = await response.json();
      
      if (responseData.success) {
        console.log(`✅ View deleted successfully`);
      } else {
        throw new Error('API returned success: false');
      }
    } catch (error) {
      console.error('❌ Error deleting view:', error);
      throw error;
    }
  },

  async updateView(viewId: number, viewData: { name?: string; description?: string }): Promise<View> {
    try {
      console.log(`📝 Updating view ${viewId}...`, viewData);
      const headers = await getHeaders();
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/views/${viewId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(viewData),
      });

      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`📥 Error response: ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }

      const responseData: WorkManagementResponse<View> = await response.json();
      
      if (responseData.success && responseData.data) {
        console.log(`✅ View updated successfully:`, responseData.data);
        return responseData.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error updating view:', error);
      throw error;
    }
  },

  async getTags(): Promise<Tag[]> {
    try {
      console.log('📥 Fetching tags...');
      const headers = await getHeaders();
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/tags`, {
        method: 'GET',
        headers,
      });

      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`📥 Error response: ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }

      const responseData: WorkManagementResponse<Tag[]> = await response.json();
      
      if (responseData.success && Array.isArray(responseData.data)) {
        console.log(`✅ Tags fetched successfully:`, responseData.data);
        return responseData.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching tags:', error);
      throw error;
    }
  },

  async createTag(tagData: { name: string; color: string }): Promise<Tag> {
    try {
      console.log('📤 Creating tag...', tagData);
      const headers = await getHeaders();
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/tags`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: tagData.name,
          color: tagData.color,
        }),
      });

      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`📥 Error response: ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }

      const responseData: WorkManagementResponse<Tag> = await response.json();
      
      if (responseData.success && responseData.data) {
        console.log(`✅ Tag created successfully:`, responseData.data);
        return responseData.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error creating tag:', error);
      throw error;
    }
  },

  async updateTag(tagId: number, tagData: { name: string; color: string }): Promise<Tag> {
    try {
      console.log(`📝 Updating tag ${tagId}...`, tagData);
      const headers = await getHeaders();
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/tags/${tagId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          name: tagData.name,
          color: tagData.color,
        }),
      });

      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`📥 Error response: ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }

      const responseData: WorkManagementResponse<Tag> = await response.json();
      
      if (responseData.success && responseData.data) {
        console.log(`✅ Tag updated successfully:`, responseData.data);
        return responseData.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error updating tag:', error);
      throw error;
    }
  },

  async deleteTag(tagId: number): Promise<void> {
    try {
      console.log(`🗑️ Deleting tag ${tagId}...`);
      const headers = await getHeaders();
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/tags/${tagId}`, {
        method: 'DELETE',
        headers,
      });

      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`📥 Error response: ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }

      const responseData: any = await response.json();
      
      if (responseData.success) {
        console.log(`✅ Tag deleted successfully`);
      } else {
        throw new Error('API returned success: false');
      }
    } catch (error) {
      console.error('❌ Error deleting tag:', error);
      throw error;
    }
  },

  async getWorkItemsByCategory(categoryId: number): Promise<WorkItem[]> {
    try {
      console.log(`📂 Fetching work items for category ${categoryId}...`);
      const headers = await getHeaders();
      
      const response = await fetch(`${WORK_MANAGEMENT_API}/categories/${categoryId}/work-items`, {
        method: 'GET',
        headers,
      });

      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`📥 Error response: ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }

      const responseData: WorkManagementResponse<WorkItem[]> = await response.json();
      
      if (responseData.success) {
        console.log(`✅ Fetched ${responseData.data.length} work items for category ${categoryId}`);
        return responseData.data;
      } else {
        throw new Error('API returned success: false');
      }
    } catch (error) {
      console.error('❌ Error fetching work items by category:', error);
      throw error;
    }
  },
};

// ============================================================================
// API KEY SERVICE INTERFACES AND METHODS
// ============================================================================

export interface APIKey {
  id: number;
  name: string;
  authkey: string;
  c_company_id: number;
  created_by: number;
  last_validated_at: string | null;
  throttle_limit: string;
  temporary_throttle_limit: string;
  temporary_throttle_time: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_active: boolean;
}

export interface APIKeysResponse {
  data: {
    data: APIKey[];
    itemsPerPage: number;
    pageNo: number;
    pageNumber: number;
    totalEntityCount: number;
    totalPageCount: number;
  };
  status: string;
  hasError: boolean;
  errors: string[];
  proxy_duration: number;
}

export interface CreateAPIKeyResponse {
  data: APIKey;
  status: string;
  hasError: boolean;
  errors: string[];
  proxy_duration: number;
}

export class APIKeyService {
  private static readonly BASE_URL = 'https://routes.msg91.com/api';

  static async getAPIKeys(): Promise<APIKey[]> {
    try {
      console.log('🔑 [APIKeyService] Fetching API keys...');
      const token = await getProxyAuthToken();
      if (!token) {
        throw new Error('No proxy auth token available');
      }

      const response = await axios.get<APIKeysResponse>(
        `${this.BASE_URL}/c/authkey`,
        {
          headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'Origin': 'https://work.50agents.com',
            'Pragma': 'no-cache',
            'Priority': 'u=1, i',
            'proxy_auth_token': token,
            'Referer': 'https://work.50agents.com/',
            'Sec-CH-UA': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"macOS"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
          },
        }
      );

      if (response.data.status === 'success' && response.data.data?.data) {
        console.log('✅ [APIKeyService] API keys fetched successfully:', response.data.data.data.length);
        return response.data.data.data;
      } else {
        console.warn('⚠️ [APIKeyService] API returned success=false');
        return [];
      }
    } catch (error: any) {
      console.error('❌ [APIKeyService] Error fetching API keys:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  }

  static async createAPIKey(name: string): Promise<APIKey> {
    try {
      console.log('🔑 [APIKeyService] Creating API key:', name);
      const token = await getProxyAuthToken();
      if (!token) {
        throw new Error('No proxy auth token available');
      }

      const response = await axios.post<CreateAPIKeyResponse>(
        `${this.BASE_URL}/c/authkey`,
        {
          name,
          throttle_limit: '60:800',
          temporary_throttle_limit: '60:600',
          temporary_throttle_time: '30',
        },
        {
          headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'Origin': 'https://work.50agents.com',
            'Pragma': 'no-cache',
            'Priority': 'u=1, i',
            'proxy_auth_token': token,
            'Referer': 'https://work.50agents.com/',
            'Sec-CH-UA': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"macOS"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
          },
        }
      );

      if (response.data.status === 'success' && response.data.data) {
        console.log('✅ [APIKeyService] API key created successfully:', response.data.data);
        return response.data.data;
      } else {
        throw new Error('Failed to create API key');
      }
    } catch (error: any) {
      console.error('❌ [APIKeyService] Error creating API key:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  }

  static async deleteAPIKey(id: number): Promise<void> {
    try {
      console.log('🔑 [APIKeyService] Deleting API key:', id);
      const token = await getProxyAuthToken();
      if (!token) {
        throw new Error('No proxy auth token available');
      }

      const response = await axios.delete(
        `${this.BASE_URL}/c/authkey/${id}`,
        {
          headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'Origin': 'https://work.50agents.com',
            'Pragma': 'no-cache',
            'Priority': 'u=1, i',
            'proxy_auth_token': token,
            'Referer': 'https://work.50agents.com/',
            'Sec-CH-UA': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"macOS"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
          },
        }
      );

      if (response.data.status === 'success') {
        console.log('✅ [APIKeyService] API key deleted successfully');
      } else {
        throw new Error('Failed to delete API key');
      }
    } catch (error: any) {
      console.error('❌ [APIKeyService] Error deleting API key:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  }

  static maskAuthKey(authkey: string): string {
    if (!authkey || authkey.length < 8) return '****';
    const first = authkey.substring(0, 4);
    const last = authkey.substring(authkey.length - 4);
    const masked = '*'.repeat(authkey.length - 8);
    return `${first}${masked}${last}`;
  }
}

// ============================================================================
// AUTOMATION SERVICE INTERFACES AND METHODS
// ============================================================================

export interface Automation {
  id: number;
  orgId: number;
  name: string;
  eventType: string | null;
  conditionLabel: string;
  conditionCode: string | null;
  promptTemplate: string;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationApiResponse {
  success: boolean;
  data: Automation[];
}

export class AutomationService {
  private static readonly BASE_URL = 'https://work-management-backend-1091285226236.asia-south1.run.app';

  static async getAutomations(): Promise<Automation[]> {
    try {
      console.log('⚡ [AutomationService] Fetching automations...');
      const token = await getProxyAuthToken();
      if (!token) {
        throw new Error('No proxy auth token available');
      }

      const response = await axios.get<AutomationApiResponse>(
        `${this.BASE_URL}/system-prompts`,
        {
          headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'Origin': 'https://work.50agents.com',
            'Pragma': 'no-cache',
            'Priority': 'u=1, i',
            'proxy_auth_token': token,
            'Referer': 'https://work.50agents.com/',
            'Sec-CH-UA': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"macOS"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
          },
        }
      );

      if (response.data.success && response.data.data) {
        console.log('✅ [AutomationService] Automations fetched successfully:', response.data.data.length);
        return response.data.data;
      } else {
        console.warn('⚠️ [AutomationService] API returned success=false');
        return [];
      }
    } catch (error: any) {
      console.error('❌ [AutomationService] Error fetching automations:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  }

  static async createAutomation(automation: Partial<Automation>): Promise<Automation> {
    try {
      console.log('⚡ [AutomationService] Creating automation:', automation.name);
      const token = await getProxyAuthToken();
      if (!token) {
        throw new Error('No proxy auth token available');
      }

      const response = await axios.post<Automation>(
        `${this.BASE_URL}/system-prompts`,
        automation,
        {
          headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'Origin': 'https://work.50agents.com',
            'Pragma': 'no-cache',
            'Priority': 'u=1, i',
            'proxy_auth_token': token,
            'Referer': 'https://work.50agents.com/',
            'Sec-CH-UA': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"macOS"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
          },
        }
      );

      console.log('✅ [AutomationService] Automation created successfully:', response.data);
      const result = (response.data as any).data || response.data;
      return result as Automation;
    } catch (error: any) {
      console.error('❌ [AutomationService] Error creating automation:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  }

  static async updateAutomation(id: number, automation: Partial<Automation>): Promise<Automation> {
    try {
      console.log('⚡ [AutomationService] Updating automation:', id);
      const token = await getProxyAuthToken();
      if (!token) {
        throw new Error('No proxy auth token available');
      }

      const response = await axios.patch<Automation>(
        `${this.BASE_URL}/system-prompts/${id}`,
        automation,
        {
          headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'Origin': 'https://work.50agents.com',
            'Pragma': 'no-cache',
            'Priority': 'u=1, i',
            'proxy_auth_token': token,
            'Referer': 'https://work.50agents.com/',
            'Sec-CH-UA': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"macOS"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
          },
        }
      );

      console.log('✅ [AutomationService] Automation updated successfully:', response.data);
      const result = (response.data as any).data || response.data;
      return result as Automation;
    } catch (error: any) {
      console.error('❌ [AutomationService] Error updating automation:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  }

  static async deleteAutomation(id: number): Promise<void> {
    try {
      console.log('⚡ [AutomationService] Deleting automation:', id);
      const token = await getProxyAuthToken();
      if (!token) {
        throw new Error('No proxy auth token available');
      }

      await axios.delete(
        `${this.BASE_URL}/system-prompts/${id}`,
        {
          headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'Origin': 'https://work.50agents.com',
            'Pragma': 'no-cache',
            'Priority': 'u=1, i',
            'proxy_auth_token': token,
            'Referer': 'https://work.50agents.com/',
            'Sec-CH-UA': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"macOS"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
          },
        }
      );

      console.log('✅ [AutomationService] Automation deleted successfully');
    } catch (error: any) {
      console.error('❌ [AutomationService] Error deleting automation:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  }
}

// ============================================================================
// WEBHOOK SERVICE INTERFACES AND METHODS
// ============================================================================

export interface Webhook {
  id: number;
  orgId: number;
  name: string;
  webhookUrl: string;
  headers: Record<string, string> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhooksResponse {
  success: boolean;
  data: Webhook[];
}

export interface CreateWebhookResponse {
  success: boolean;
  data: Webhook;
}

export interface DeleteWebhookResponse {
  success: boolean;
  message: string;
}

export class WebhookService {
  private static readonly BASE_URL = 'https://work-management-backend-1091285226236.asia-south1.run.app';

  static async getWebhooks(): Promise<Webhook[]> {
    try {
      console.log('🪝 [WebhookService] Fetching webhooks...');
      const token = await getProxyAuthToken();
      if (!token) {
        throw new Error('No proxy auth token available');
      }

      const response = await axios.get<WebhooksResponse>(
        `${this.BASE_URL}/webhook`,
        {
          headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'Origin': 'https://work.50agents.com',
            'Pragma': 'no-cache',
            'Priority': 'u=1, i',
            'proxy_auth_token': token,
            'Referer': 'https://work.50agents.com/',
            'Sec-CH-UA': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"macOS"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
          },
        }
      );

      if (response.data.success && Array.isArray(response.data.data)) {
        console.log('✅ [WebhookService] Webhooks fetched successfully:', response.data.data.length);
        return response.data.data;
      } else {
        console.warn('⚠️ [WebhookService] API returned success=false');
        return [];
      }
    } catch (error: any) {
      console.error('❌ [WebhookService] Error fetching webhooks:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  }

  static async createWebhook(
    name: string,
    webhookUrl: string,
    isActive: boolean = true,
    headers?: Record<string, string> | null
  ): Promise<Webhook> {
    try {
      console.log('🪝 [WebhookService] Creating webhook:', name);
      const token = await getProxyAuthToken();
      if (!token) {
        throw new Error('No proxy auth token available');
      }

      const payload: any = {
        name,
        webhookUrl,
        isActive,
      };

      if (headers) {
        payload.headers = headers;
      }

      const response = await axios.post<CreateWebhookResponse>(
        `${this.BASE_URL}/webhook`,
        payload,
        {
          headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'Origin': 'https://work.50agents.com',
            'Pragma': 'no-cache',
            'Priority': 'u=1, i',
            'proxy_auth_token': token,
            'Referer': 'https://work.50agents.com/',
            'Sec-CH-UA': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"macOS"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
          },
        }
      );

      if (response.data.success && response.data.data) {
        console.log('✅ [WebhookService] Webhook created successfully:', response.data.data);
        return response.data.data;
      } else {
        throw new Error('Failed to create webhook');
      }
    } catch (error: any) {
      console.error('❌ [WebhookService] Error creating webhook:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  }

  static async updateWebhook(
    id: number,
    name: string,
    webhookUrl: string,
    isActive: boolean,
    headers?: Record<string, string> | null
  ): Promise<Webhook> {
    try {
      console.log('🪝 [WebhookService] Updating webhook:', id);
      const token = await getProxyAuthToken();
      if (!token) {
        throw new Error('No proxy auth token available');
      }

      const payload: any = {
        name,
        webhookUrl,
        isActive,
      };

      if (headers) {
        payload.headers = headers;
      }

      const response = await axios.patch<CreateWebhookResponse>(
        `${this.BASE_URL}/webhook/${id}`,
        payload,
        {
          headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'Origin': 'https://work.50agents.com',
            'Pragma': 'no-cache',
            'Priority': 'u=1, i',
            'proxy_auth_token': token,
            'Referer': 'https://work.50agents.com/',
            'Sec-CH-UA': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"macOS"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
          },
        }
      );

      if (response.data.success && response.data.data) {
        console.log('✅ [WebhookService] Webhook updated successfully:', response.data.data);
        return response.data.data;
      } else {
        throw new Error('Failed to update webhook');
      }
    } catch (error: any) {
      console.error('❌ [WebhookService] Error updating webhook:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  }

  static async deleteWebhook(id: number): Promise<void> {
    try {
      console.log('🪝 [WebhookService] Deleting webhook:', id);
      const token = await getProxyAuthToken();
      if (!token) {
        throw new Error('No proxy auth token available');
      }

      const response = await axios.delete<DeleteWebhookResponse>(
        `${this.BASE_URL}/webhook/${id}`,
        {
          headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'Origin': 'https://work.50agents.com',
            'Pragma': 'no-cache',
            'Priority': 'u=1, i',
            'proxy_auth_token': token,
            'Referer': 'https://work.50agents.com/',
            'Sec-CH-UA': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"macOS"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
          },
        }
      );

      if (response.data.success) {
        console.log('✅ [WebhookService] Webhook deleted successfully');
      } else {
        throw new Error('Failed to delete webhook');
      }
    } catch (error: any) {
      console.error('❌ [WebhookService] Error deleting webhook:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  }

  static isValidWebhookUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
    } catch {
      return false;
    }
  }

  static parseHeaders(headersJson: string): Record<string, string> | null {
    try {
      if (!headersJson || headersJson.trim() === '{}') {
        return null;
      }
      return JSON.parse(headersJson);
    } catch {
      return null;
    }
  }

  static stringifyHeaders(headers: Record<string, string> | null): string {
    if (!headers) {
      return '{}';
    }
    return JSON.stringify(headers, null, 2);
  }
}
