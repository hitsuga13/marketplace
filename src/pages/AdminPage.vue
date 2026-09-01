<!-- Purpose: Admin dashboard for user/product/order management, receipt audit, refunds, and CSV report generation. -->
<template>
  <q-page class="role-page admin-page">
    <section class="role-hero admin-hero">
      <div>
        <q-badge color="secondary" text-color="dark" label="Admin Dashboard" />
        <h1>Manage marketplace users and products</h1>
        <p>Review users, control product visibility, and generate a simple marketplace report.</p>
      </div>
    </section>

    <section class="role-band">
      <div class="report-grid">
        <div class="report-metric">
          <span>{{ users.length }}</span>
          <small>Total users</small>
        </div>
        <div class="report-metric">
          <span>{{ sellerProducts.length }}</span>
          <small>Seller products</small>
        </div>
        <div class="report-metric">
          <span>{{ activeProducts }}</span>
          <small>Active products</small>
        </div>
        <div class="report-metric">
          <span>{{ pendingOrders.length }}</span>
          <small>Pending payments</small>
        </div>
        <div class="report-metric">
          <span>RM {{ totalSales.toFixed(2) }}</span>
          <small>Confirmed sales</small>
        </div>
        <div class="report-metric">
          <span>{{ orders.length }}</span>
          <small>Total orders</small>
        </div>
      </div>
    </section>

    <section class="role-band admin-workspace-nav">
      <q-tabs
        v-model="adminActiveTab"
        align="left"
        dense
        active-color="primary"
        indicator-color="primary"
        class="admin-module-tabs"
      >
        <q-tab name="overview" icon="dashboard" label="Overview" />
        <q-tab name="moderation" icon="policy" label="AI Moderation" />
        <q-tab name="users" icon="groups" label="Users" />
        <q-tab name="products" icon="inventory_2" label="Products" />
        <q-tab name="orders" icon="receipt_long" label="Orders & Receipts" />
        <q-tab name="reports" icon="summarize" label="Reports" />
      </q-tabs>
    </section>

    <section v-show="adminActiveTab === 'reports'" class="role-band">
      <q-card flat bordered class="role-card admin-report-module">
        <q-card-section>
          <div class="admin-report-header">
            <div>
              <div class="text-h6 text-weight-bold">Report Module</div>
              <div class="text-grey-7">Pick a report type, generate report, then export to CSV.</div>
            </div>
            <q-chip
              :color="generatedReport ? 'positive' : 'grey-5'"
              text-color="white"
              icon="summarize"
              :label="generatedReport ? 'Report Ready' : 'Waiting for Generate'"
            />
          </div>

          <div class="admin-report-flow q-mt-md">
            <q-select
              v-model="selectedReportType"
              outlined
              dense
              label="Report type"
              :options="reportTypeOptions"
              emit-value
              map-options
            />
            <q-btn
              unelevated
              color="primary"
              icon="play_arrow"
              label="Generate Report"
              no-caps
              @click="generateReport"
            />
            <q-btn
              outline
              color="primary"
              icon="download"
              label="Export CSV"
              no-caps
              :disable="!generatedReport"
              @click="exportReportCsv"
            />
          </div>

          <div class="admin-report-filters q-mt-md">
            <q-select
              v-model="reportSellerFilter"
              outlined
              dense
              clearable
              label="Seller filter"
              :options="reportSellerOptions"
            />
            <q-select
              v-model="reportStatusFilter"
              outlined
              dense
              clearable
              label="Order status"
              :options="reportStatusOptions"
            />
            <q-input v-model="reportStartDate" outlined dense type="date" label="Start date" />
            <q-input v-model="reportEndDate" outlined dense type="date" label="End date" />
            <q-btn flat color="grey-7" icon="restart_alt" label="Clear" no-caps @click="clearReportFilters" />
          </div>

          <div v-if="generatedReport" class="admin-report-output q-mt-lg">
            <div class="admin-report-summary">
              <div>
                <span>{{ generatedReport.title }}</span>
                <small>{{ generatedReport.rows.length }} row(s) generated</small>
              </div>
              <q-badge color="primary" :label="generatedReport.generatedAt" />
            </div>

            <q-markup-table flat bordered class="q-mt-md admin-report-table">
              <thead>
                <tr>
                  <th v-for="column in generatedReport.columns" :key="column.key" class="text-left">
                    {{ column.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in generatedReport.rows" :key="index">
                  <td v-for="column in generatedReport.columns" :key="column.key">
                    {{ row[column.key] }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>

          <q-banner v-else class="role-banner q-mt-md">
            Open report module by choosing a report type, then click Generate Report.
          </q-banner>
        </q-card-section>
      </q-card>
    </section>

    <section v-show="adminActiveTab === 'overview'" class="role-band admin-grid">
      <q-card flat bordered class="role-card">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Action Queue</div>
          <q-list separator class="q-mt-md">
            <q-item>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" icon="policy" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">AI moderation final checks</q-item-label>
                <q-item-label caption>{{ unreviewedAiDecisions.length }} product(s) awaiting admin review</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn dense flat color="primary" label="Open" no-caps @click="adminActiveTab = 'moderation'" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-avatar color="warning" text-color="white" icon="receipt_long" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Pending payments</q-item-label>
                <q-item-label caption>{{ pendingOrders.length }} order(s) still in progress</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn dense flat color="primary" label="Open" no-caps @click="adminActiveTab = 'orders'" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="role-card">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Recent Moderation</div>
          <q-list v-if="moderationAuditLog.length" separator class="q-mt-md">
            <q-item v-for="product in moderationAuditLog.slice(0, 4)" :key="product.id">
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ product.name }}</q-item-label>
                <q-item-label caption>{{ product.vendor || product.seller || '-' }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip
                  dense
                  :color="getModerationStatusColor(product.moderationStatus)"
                  text-color="white"
                  :label="getModerationStatusLabel(product.moderationStatus)"
                />
              </q-item-section>
            </q-item>
          </q-list>
          <q-banner v-else class="role-banner q-mt-md">No moderation activity yet.</q-banner>
        </q-card-section>
      </q-card>
    </section>

    <section v-show="adminActiveTab === 'moderation'" class="role-band">
      <q-card flat bordered class="role-card">
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <div class="text-h6 text-weight-bold">AI Product Moderation</div>
              <div class="text-grey-7">Final-check every AI decision, including published approvals.</div>
            </div>
            <q-chip
              color="primary"
              text-color="white"
              icon="policy"
              :label="`${unreviewedAiDecisions.length} Awaiting Final Check`"
            />
          </div>

          <q-list v-if="unreviewedAiDecisions.length" separator class="q-mt-md">
            <q-item v-for="product in unreviewedAiDecisions" :key="product.id">
              <q-item-section avatar>
                <q-avatar square rounded>
                  <img :src="getImageSrc(product.image)" :alt="product.name" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ product.name }}</q-item-label>
                <q-item-label caption>{{ product.vendor }} / {{ product.category }}</q-item-label>
                <q-item-label caption>
                  {{ product.moderationReason || 'No moderation reason recorded.' }}
                </q-item-label>
                <q-item-label caption>
                  AI decision: {{ product.moderationDecision || product.moderationStatus }}
                </q-item-label>
                <q-item-label caption>
                  Confidence:
                  {{
                    product.moderationConfidence === null ||
                    product.moderationConfidence === undefined
                      ? '-'
                      : `${Math.round(Number(product.moderationConfidence) * 100)}%`
                  }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip
                  dense
                  :color="getModerationStatusColor(product.moderationStatus)"
                  text-color="white"
                  :label="getModerationStatusLabel(product.moderationStatus)"
                />
              </q-item-section>
              <q-item-section side class="admin-order-actions">
                <q-btn
                  dense
                  unelevated
                  color="primary"
                  icon="check_circle"
                  :label="getConfirmAiLabel(product)"
                  no-caps
                  @click="confirmAiDecision(product.id)"
                />
                <q-btn
                  dense
                  flat
                  :color="product.moderationStatus === moderationStatuses.approved ? 'negative' : 'positive'"
                  :icon="product.moderationStatus === moderationStatuses.approved ? 'block' : 'publish'"
                  :label="getOverrideAiLabel(product)"
                  no-caps
                  @click="overrideAiDecision(product.id)"
                />
              </q-item-section>
            </q-item>
          </q-list>

          <q-banner v-else class="role-banner q-mt-md">
            No AI moderation decisions waiting for admin final check.
          </q-banner>
        </q-card-section>
      </q-card>
    </section>

    <section v-show="adminActiveTab === 'moderation'" class="role-band">
      <q-card flat bordered class="role-card">
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <div class="text-h6 text-weight-bold">Moderation Audit Log</div>
              <div class="text-grey-7">
                Full AI decision history with admin confirmation and override status.
              </div>
            </div>
            <q-chip
              color="secondary"
              text-color="dark"
              icon="fact_check"
              :label="`${moderationAuditLog.length} Records`"
            />
          </div>

          <q-markup-table
            v-if="moderationAuditLog.length"
            flat
            bordered
            class="q-mt-md admin-report-table moderation-audit-table"
          >
            <thead>
              <tr>
                <th class="text-left">Product</th>
                <th class="text-left">Seller</th>
                <th class="text-left">AI Decision</th>
                <th class="text-left">Review Status</th>
                <th class="text-left">Confidence</th>
                <th class="text-left">Checked</th>
                <th class="text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in moderationAuditLog" :key="product.id">
                <td>
                  <div class="text-weight-bold">{{ product.name }}</div>
                  <div class="text-caption text-grey-7">{{ product.category }}</div>
                </td>
                <td>{{ product.vendor || product.seller || '-' }}</td>
                <td>
                  <q-chip
                    dense
                    square
                    :color="getModerationStatusColor(product.moderationStatus)"
                    text-color="white"
                    :label="getModerationStatusLabel(product.moderationStatus)"
                  />
                </td>
                <td>
                  <q-chip
                    dense
                    square
                    :color="getAdminReviewStatusColor(product)"
                    text-color="white"
                    :label="getAdminReviewStatusLabel(product)"
                  />
                </td>
                <td>{{ getModerationConfidenceLabel(product) }}</td>
                <td>{{ formatDateTime(product.moderationCheckedAt || product.createdAt) }}</td>
                <td class="moderation-audit-reason">
                  {{ product.reviewNote || product.moderationReason || 'No reason recorded.' }}
                </td>
              </tr>
            </tbody>
          </q-markup-table>

          <q-banner v-else class="role-banner q-mt-md">
            No moderation records yet.
          </q-banner>
        </q-card-section>
      </q-card>
    </section>

    <section v-show="adminActiveTab === 'users' || adminActiveTab === 'products'" class="role-band">
      <q-card v-show="adminActiveTab === 'users'" flat bordered class="role-card">
        <q-card-section>
          <div class="admin-report-header">
            <div>
              <div class="text-h6 text-weight-bold">Manage Users</div>
              <div class="text-grey-7">Search accounts, inspect roles, and manage seller moderation risk.</div>
            </div>
            <q-chip color="primary" text-color="white" icon="groups" :label="`${filteredUsers.length} Users`" />
          </div>

          <div class="admin-user-tools q-mt-md">
            <q-input v-model="userSearch" outlined dense placeholder="Search users...">
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
            </q-input>
            <q-select
              v-model="userRoleFilter"
              outlined
              dense
              label="Role"
              :options="userRoleOptions"
              emit-value
              map-options
            />
          </div>

          <q-list v-if="filteredUsers.length" separator class="q-mt-md admin-user-list">
            <q-item v-for="user in filteredUsers" :key="user.id" class="admin-user-item">
              <q-item-section>
                <q-item-label class="text-weight-bold row items-center q-gutter-xs">
                  <span>{{ user.name }}</span>
                  <q-chip dense square :color="getRoleColor(user.role)" text-color="white" :label="user.role" />
                  <q-chip
                    dense
                    square
                    :color="user.active === false ? 'negative' : 'positive'"
                    text-color="white"
                    :label="user.active === false ? 'Suspended' : 'Active'"
                  />
                </q-item-label>
                <q-item-label caption>{{ user.email }}</q-item-label>
                <q-item-label v-if="user.role === 'seller'" caption>
                  Moderation warnings: {{ getSellerWarningCount(user) }}/3 ·
                  Products: {{ getSellerProductCount(user) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side class="admin-user-actions">
                <q-btn dense flat color="primary" icon="visibility" label="View" no-caps @click="openUserDetails(user)" />
                <q-btn
                  dense
                  :flat="user.active !== false"
                  :unelevated="user.active === false"
                  :color="user.active === false ? 'positive' : 'negative'"
                  :icon="user.active === false ? 'check_circle' : 'block'"
                  :label="user.active === false ? 'Reactivate' : 'Suspend'"
                  no-caps
                  @click="confirmUserStatusChange(user, user.active === false)"
                />
              </q-item-section>
            </q-item>
          </q-list>

          <q-banner v-else class="role-banner q-mt-md">No users match this filter.</q-banner>
        </q-card-section>
      </q-card>

      <q-card v-show="adminActiveTab === 'products'" flat bordered class="role-card">
        <q-card-section>
          <div class="admin-report-header">
            <div>
              <div class="text-h6 text-weight-bold">Manage Products</div>
              <div class="text-grey-7">Inspect listings, moderation status, and product visibility.</div>
            </div>
            <q-chip color="primary" text-color="white" icon="inventory_2" :label="`${filteredProducts.length} Products`" />
          </div>

          <div class="admin-product-tools q-mt-md">
            <q-input v-model="productSearch" outlined dense placeholder="Search products...">
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
            </q-input>
            <q-select
              v-model="productModerationFilter"
              outlined
              dense
              label="Moderation"
              :options="productModerationOptions"
              emit-value
              map-options
            />
            <q-select
              v-model="productVisibilityFilter"
              outlined
              dense
              label="Visibility"
              :options="productVisibilityOptions"
              emit-value
              map-options
            />
          </div>

          <q-list v-if="filteredProducts.length" separator class="q-mt-md admin-product-list">
            <q-item v-for="product in filteredProducts" :key="product.id" class="admin-product-item">
              <q-item-section avatar>
                <q-avatar square rounded>
                  <img :src="getImageSrc(product.image)" :alt="product.name" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold row items-center q-gutter-xs">
                  <span>{{ product.name }}</span>
                  <q-chip
                    dense
                    square
                    :color="getModerationStatusColor(product.moderationStatus)"
                    text-color="white"
                    :label="getModerationStatusLabel(product.moderationStatus)"
                  />
                  <q-chip
                    dense
                    square
                    :color="product.active === false ? 'grey-7' : 'positive'"
                    text-color="white"
                    :label="product.active === false ? 'Hidden' : 'Published'"
                  />
                </q-item-label>
                <q-item-label caption>{{ product.vendor }} / {{ product.category }}</q-item-label>
                <q-item-label caption>
                  RM {{ Number(product.price || 0).toFixed(2) }} · Stock {{ product.stock ?? 'not set' }} ·
                  {{ getAdminReviewStatusLabel(product) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side class="admin-product-actions">
                <q-btn dense flat color="primary" icon="visibility" label="View" no-caps @click="openProductDetails(product)" />
                <q-btn
                  dense
                  :flat="product.active !== false"
                  :unelevated="product.active === false"
                  :color="product.active === false ? 'positive' : 'grey-7'"
                  :icon="product.active === false ? 'visibility' : 'visibility_off'"
                  :label="product.active === false ? 'Publish' : 'Hide'"
                  no-caps
                  :disable="product.moderationStatus !== moderationStatuses.approved"
                  @click="confirmProductVisibilityChange(product, product.active === false)"
                />
                <q-btn flat round color="negative" icon="delete" @click="deleteProduct(product.id)" />
              </q-item-section>
            </q-item>
          </q-list>

          <q-banner v-else class="role-banner q-mt-md">No products match this filter.</q-banner>
        </q-card-section>
      </q-card>
    </section>

    <section v-show="adminActiveTab === 'orders'" class="role-band">
      <q-card flat bordered class="role-card">
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <div class="text-h6 text-weight-bold">Payment Receipts & Orders</div>
              <div class="text-grey-7">Audit buyer receipts and marketplace order status.</div>
            </div>
            <q-chip color="primary" text-color="white" icon="receipt_long" :label="`${pendingOrders.length} Pending`" />
          </div>

          <q-list v-if="orders.length" separator class="q-mt-md">
            <q-item v-for="order in orders" :key="order.id">
              <q-item-section avatar>
                <q-avatar square rounded>
                  <img :src="getImageSrc(order.image)" :alt="order.productName" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ order.productName }}</q-item-label>
                <q-item-label caption>
                  {{ order.vendor }} / RM {{ Number(order.total || 0).toFixed(2) }}
                </q-item-label>
                <q-item-label v-if="getOrderOptionText(order)" caption>
                  {{ getOrderOptionText(order) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip dense :color="getStatusColor(order.status)" text-color="white" :label="order.status" />
              </q-item-section>
              <q-item-section side class="admin-order-actions">
                <q-btn outline dense color="primary" icon="receipt" label="Receipt" no-caps @click="viewReceipt(order)" />
                <q-btn
                  v-if="order.status !== 'Completed'"
                  dense
                  unelevated
                  color="positive"
                  icon="check_circle"
                  label="Complete"
                  no-caps
                  @click="updateAdminOrderStatus(order.id, 'Completed')"
                />
                <q-btn
                  v-if="order.status !== 'Refunded'"
                  dense
                  flat
                  color="warning"
                  icon="undo"
                  label="Refund"
                  no-caps
                  @click="updateAdminOrderStatus(order.id, 'Refunded')"
                />
                <q-btn
                  v-if="order.status === 'In Progress' || order.status === 'Seller Confirmed'"
                  dense
                  flat
                  color="negative"
                  icon="cancel"
                  label="Reject"
                  no-caps
                  @click="updateAdminOrderStatus(order.id, 'Rejected')"
                />
              </q-item-section>
            </q-item>
          </q-list>

          <q-banner v-else class="role-banner q-mt-md">No buyer orders yet.</q-banner>
        </q-card-section>
      </q-card>
    </section>

    <q-dialog v-model="receiptDialog">
      <q-card class="receipt-preview-card">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-h6 text-weight-bold">Payment Receipt</div>
            <div class="text-grey-7">{{ selectedReceiptOrder?.productName }}</div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-img
            v-if="selectedReceiptOrder?.receipt?.startsWith('data:image')"
            :src="selectedReceiptOrder.receipt"
            fit="contain"
            class="receipt-preview-image"
          />
          <q-banner v-else class="role-banner">
            Receipt uploaded as {{ selectedReceiptOrder?.receiptFileName || 'file' }}. Image preview is only available for image receipts.
          </q-banner>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="userDetailsDialog">
      <q-card class="admin-user-detail-card">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-h6 text-weight-bold">{{ selectedUser?.name }}</div>
            <div class="text-grey-7">{{ selectedUser?.email }}</div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section v-if="selectedUser">
          <div class="admin-user-detail-grid">
            <div>
              <span>Role</span>
              <strong>{{ selectedUser.role }}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{{ selectedUser.active === false ? 'Suspended' : 'Active' }}</strong>
            </div>
            <div>
              <span>Phone</span>
              <strong>{{ selectedUser.phone || '-' }}</strong>
            </div>
            <div>
              <span>Last seen</span>
              <strong>{{ formatDateTime(selectedUser.lastSeenAt) }}</strong>
            </div>
            <div v-if="selectedUser.role === 'seller'">
              <span>Seller products</span>
              <strong>{{ getSellerProductCount(selectedUser) }}</strong>
            </div>
            <div v-if="selectedUser.role === 'seller'">
              <span>Moderation warnings</span>
              <strong>{{ getSellerWarningCount(selectedUser) }}/3</strong>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat color="grey-7" label="Close" no-caps v-close-popup />
          <q-btn
            unelevated
            :color="selectedUser?.active === false ? 'positive' : 'negative'"
            :icon="selectedUser?.active === false ? 'check_circle' : 'block'"
            :label="selectedUser?.active === false ? 'Reactivate Account' : 'Suspend Account'"
            no-caps
            @click="confirmUserStatusChange(selectedUser, selectedUser?.active === false)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="productDetailsDialog">
      <q-card class="admin-product-detail-card">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-h6 text-weight-bold">{{ selectedProduct?.name }}</div>
            <div class="text-grey-7">{{ selectedProduct?.vendor || selectedProduct?.seller || '-' }}</div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section v-if="selectedProduct">
          <q-img
            :src="getImageSrc(selectedProduct.image)"
            :alt="selectedProduct.name"
            ratio="16/9"
            fit="cover"
            class="admin-product-detail-image"
          />
          <div class="admin-user-detail-grid q-mt-md">
            <div>
              <span>Moderation</span>
              <strong>{{ getModerationStatusLabel(selectedProduct.moderationStatus) }}</strong>
            </div>
            <div>
              <span>Visibility</span>
              <strong>{{ selectedProduct.active === false ? 'Hidden' : 'Published' }}</strong>
            </div>
            <div>
              <span>Price</span>
              <strong>RM {{ Number(selectedProduct.price || 0).toFixed(2) }}</strong>
            </div>
            <div>
              <span>Stock</span>
              <strong>{{ selectedProduct.stock ?? 'Not set' }}</strong>
            </div>
            <div>
              <span>Admin review</span>
              <strong>{{ getAdminReviewStatusLabel(selectedProduct) }}</strong>
            </div>
            <div>
              <span>AI confidence</span>
              <strong>{{ getModerationConfidenceLabel(selectedProduct) }}</strong>
            </div>
          </div>
          <q-banner class="role-banner q-mt-md">
            {{ selectedProduct.reviewNote || selectedProduct.moderationReason || 'No moderation reason recorded.' }}
          </q-banner>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat color="grey-7" label="Close" no-caps v-close-popup />
          <q-btn
            unelevated
            :color="selectedProduct?.active === false ? 'positive' : 'grey-7'"
            :icon="selectedProduct?.active === false ? 'visibility' : 'visibility_off'"
            :label="selectedProduct?.active === false ? 'Publish Product' : 'Hide Product'"
            no-caps
            :disable="selectedProduct?.moderationStatus !== moderationStatuses.approved"
            @click="confirmProductVisibilityChange(selectedProduct, selectedProduct?.active === false)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { normalizeStoredImage } from 'src/utils/assets'
import {
  getModerationStatusColor,
  getModerationStatusLabel,
  moderationStatuses,
} from 'src/utils/productModeration'
import {
  getOrders,
  getSellerProducts,
  getUsers,
  fetchOrderReceipt,
  deleteSellerProduct,
  saveSellerProducts,
  saveUsers as saveStoredUsers,
  updateOrderStatus,
} from 'src/database'

const $q = useQuasar()
const users = ref(getUsers())
const sellerProducts = ref(getSellerProducts())
const orders = ref(getOrders())
const adminActiveTab = ref('overview')
const receiptDialog = ref(false)
const userDetailsDialog = ref(false)
const productDetailsDialog = ref(false)
const selectedUser = ref(null)
const selectedProduct = ref(null)
const userSearch = ref('')
const userRoleFilter = ref('all')
const productSearch = ref('')
const productModerationFilter = ref('all')
const productVisibilityFilter = ref('all')
const selectedReceiptOrder = ref(null)
const selectedReportType = ref('marketplace-summary')
const generatedReport = ref(null)
const reportSellerFilter = ref(null)
const reportStatusFilter = ref(null)
const reportStartDate = ref('')
const reportEndDate = ref('')
const getImageSrc = (src) => normalizeStoredImage(src)

const reportTypeOptions = [
  { label: 'Marketplace Summary', value: 'marketplace-summary' },
  { label: 'User Report', value: 'user-report' },
  { label: 'Product Report', value: 'product-report' },
  { label: 'Order & Payment Report', value: 'order-payment-report' },
]
const userRoleOptions = [
  { label: 'All Roles', value: 'all' },
  { label: 'Buyer', value: 'buyer' },
  { label: 'Seller', value: 'seller' },
  { label: 'Admin', value: 'admin' },
]
const productModerationOptions = [
  { label: 'All Moderation', value: 'all' },
  { label: 'Approved', value: moderationStatuses.approved },
  { label: 'Rejected', value: moderationStatuses.rejected },
]
const productVisibilityOptions = [
  { label: 'All Visibility', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Hidden', value: 'hidden' },
]

const activeProducts = computed(() => sellerProducts.value.filter((product) => product.active !== false).length)
const filteredUsers = computed(() => {
  const query = userSearch.value.trim().toLowerCase()
  return users.value.filter((user) => {
    const matchesRole = userRoleFilter.value === 'all' || user.role === userRoleFilter.value
    const matchesSearch =
      !query ||
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)

    return matchesRole && matchesSearch
  })
})
const filteredProducts = computed(() => {
  const query = productSearch.value.trim().toLowerCase()
  return sellerProducts.value.filter((product) => {
    const matchesSearch =
      !query ||
      product.name?.toLowerCase().includes(query) ||
      product.vendor?.toLowerCase().includes(query) ||
      product.seller?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    const matchesModeration =
      productModerationFilter.value === 'all' ||
      product.moderationStatus === productModerationFilter.value
    const matchesVisibility =
      productVisibilityFilter.value === 'all' ||
      (productVisibilityFilter.value === 'published' && product.active !== false) ||
      (productVisibilityFilter.value === 'hidden' && product.active === false)

    return matchesSearch && matchesModeration && matchesVisibility
  })
})
const unreviewedAiDecisions = computed(() =>
  sellerProducts.value.filter(
    (product) =>
      product.moderationStatus &&
      !product.reviewedAt,
  ),
)
const moderationAuditLog = computed(() =>
  sellerProducts.value
    .filter((product) => product.moderationStatus)
    .slice()
    .sort(
      (a, b) =>
        new Date(b.moderationCheckedAt || b.updatedAt || b.createdAt || 0).getTime() -
        new Date(a.moderationCheckedAt || a.updatedAt || a.createdAt || 0).getTime(),
    ),
)
const reportSellerOptions = computed(() =>
  [...new Set(sellerProducts.value.map((product) => product.vendor || product.seller).filter(Boolean))].sort(),
)
const reportStatusOptions = ['In Progress', 'Seller Confirmed', 'Item Sent', 'Completed', 'Rejected', 'Cancelled', 'Refunded']
const pendingOrders = computed(() =>
  orders.value.filter((order) => ['In Progress', 'Seller Confirmed', 'Item Sent'].includes(order.status)),
)
const totalSales = computed(() =>
  orders.value.reduce((sum, order) => (order.status === 'Completed' ? sum + Number(order.total || 0) : sum), 0),
)

const saveUsers = () => {
  saveStoredUsers(users.value)
}

const getRoleColor = (role) => {
  if (role === 'admin') return 'primary'
  if (role === 'seller') return 'secondary'
  return 'info'
}

const getSellerProductsForUser = (user) =>
  sellerProducts.value.filter((product) => String(product.sellerId) === String(user?.id))

const getSellerProductCount = (user) => getSellerProductsForUser(user).length

const getSellerWarningCount = (user) =>
  getSellerProductsForUser(user).filter(
    (product) => product.moderationStatus === moderationStatuses.rejected,
  ).length

const openUserDetails = (user) => {
  selectedUser.value = user
  userDetailsDialog.value = true
}

const openProductDetails = (product) => {
  selectedProduct.value = product
  productDetailsDialog.value = true
}

const setUserActiveStatus = (userId, active) => {
  users.value = users.value.map((user) =>
    String(user.id) === String(userId) ? { ...user, active } : user,
  )
  if (selectedUser.value && String(selectedUser.value.id) === String(userId)) {
    selectedUser.value = { ...selectedUser.value, active }
  }
  saveUsers()
}

const confirmUserStatusChange = (user, active) => {
  if (!user) return
  const action = active ? 'reactivate' : 'suspend'
  $q.dialog({
    title: active ? 'Reactivate Account' : 'Suspend Account',
    message: `Are you sure you want to ${action} ${user.name}?`,
    cancel: true,
    persistent: true,
    ok: {
      label: active ? 'Reactivate' : 'Suspend',
      color: active ? 'positive' : 'negative',
      icon: active ? 'check_circle' : 'block',
    },
  }).onOk(() => {
    setUserActiveStatus(user.id, active)
    $q.notify({
      color: active ? 'positive' : 'negative',
      icon: active ? 'check_circle' : 'block',
      message: `${user.name} ${active ? 'reactivated' : 'suspended'}.`,
      position: 'top',
    })
  })
}

const setProductVisibility = (productId, active) => {
  sellerProducts.value = sellerProducts.value.map((product) =>
    String(product.id) === String(productId) ? { ...product, active } : product,
  )
  if (selectedProduct.value && String(selectedProduct.value.id) === String(productId)) {
    selectedProduct.value = { ...selectedProduct.value, active }
  }
  saveProducts()
}

const confirmProductVisibilityChange = (product, active) => {
  if (!product || product.moderationStatus !== moderationStatuses.approved) return
  const action = active ? 'publish' : 'hide'
  $q.dialog({
    title: active ? 'Publish Product' : 'Hide Product',
    message: `Are you sure you want to ${action} ${product.name}?`,
    cancel: true,
    persistent: true,
    ok: {
      label: active ? 'Publish' : 'Hide',
      color: active ? 'positive' : 'grey-7',
      icon: active ? 'visibility' : 'visibility_off',
    },
  }).onOk(() => {
    setProductVisibility(product.id, active)
    $q.notify({
      color: active ? 'positive' : 'grey-7',
      icon: active ? 'visibility' : 'visibility_off',
      message: `${product.name} ${active ? 'published' : 'hidden'}.`,
      position: 'top',
    })
  })
}

const refreshAdminData = () => {
  users.value = getUsers()
  sellerProducts.value = getSellerProducts()
  orders.value = getOrders()
}

const saveProducts = () => {
  saveSellerProducts(sellerProducts.value)
}

const getModerationConfidenceLabel = (product) =>
  product.moderationConfidence === null || product.moderationConfidence === undefined
    ? '-'
    : `${Math.round(Number(product.moderationConfidence) * 100)}%`

const getAdminReviewStatusLabel = (product) => {
  if (!product.reviewedAt) return 'Awaiting Final Check'
  if (String(product.reviewNote || '').toLowerCase().includes('overridden')) return 'Overridden'
  return 'Confirmed'
}

const getAdminReviewStatusColor = (product) => {
  if (!product.reviewedAt) return 'warning'
  if (String(product.reviewNote || '').toLowerCase().includes('overridden')) return 'purple'
  return 'positive'
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const deleteProduct = (id) => {
  const product = sellerProducts.value.find((item) => String(item.id) === String(id))
  $q.dialog({
    title: 'Delete Product',
    message: `Delete ${product?.name || 'this product'}? This action cannot be undone.`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Delete',
      color: 'negative',
      icon: 'delete',
    },
  }).onOk(() => {
    sellerProducts.value = deleteSellerProduct(id)
    $q.notify({
      color: 'negative',
      icon: 'delete',
      message: 'Product deleted.',
      position: 'top',
    })
  })
}

const getOppositeModerationStatus = (status) =>
  status === moderationStatuses.approved ? moderationStatuses.rejected : moderationStatuses.approved

const getConfirmAiLabel = (product) =>
  product.moderationStatus === moderationStatuses.approved ? 'Confirm Approved' : 'Confirm Rejected'

const getOverrideAiLabel = (product) =>
  product.moderationStatus === moderationStatuses.approved ? 'Override Reject' : 'Override Approve'

const reviewProduct = (id, status, action = 'confirm') => {
  const approved = status === moderationStatuses.approved
  const actionText = action === 'override' ? 'overrode' : 'confirmed'
  sellerProducts.value = sellerProducts.value.map((product) =>
    String(product.id) === String(id)
      ? {
          ...product,
          active: approved,
          moderationStatus: status,
          moderationDecision: approved ? 'admin_approved' : 'admin_rejected',
          moderationReason: approved
            ? `Admin ${actionText} the review and approved this product.`
            : `Admin ${actionText} the review and rejected this product.`,
          reviewedBy: 'Admin',
          reviewedAt: new Date().toISOString(),
          reviewNote:
            action === 'override'
              ? `AI decision overridden to ${status}.`
              : `AI decision confirmed as ${status}.`,
        }
      : product,
  )
  saveProducts()
  $q.notify({
    color: approved ? 'positive' : 'negative',
    icon: approved ? 'check_circle' : 'block',
    message: approved ? 'Product approved and published.' : 'Product rejected.',
    position: 'top',
  })
}

const confirmAiDecision = (id) => {
  const product = sellerProducts.value.find((item) => String(item.id) === String(id))
  if (!product) return

  reviewProduct(id, product.moderationStatus, 'confirm')
}

const overrideAiDecision = (id) => {
  const product = sellerProducts.value.find((item) => String(item.id) === String(id))
  if (!product) return

  reviewProduct(id, getOppositeModerationStatus(product.moderationStatus), 'override')
}

const getStatusColor = (status) => {
  if (status === 'Completed') return 'positive'
  if (status === 'Item Sent') return 'info'
  if (status === 'Seller Confirmed') return 'secondary'
  if (status === 'Rejected') return 'negative'
  if (status === 'Cancelled') return 'grey-7'
  if (status === 'Refunded') return 'warning'
  return 'primary'
}

const getOrderOptionText = (order) => {
  const parts = []
  if (order.selectedVariation) parts.push(`Variation: ${order.selectedVariation}`)
  if (order.selectedAddons?.length) {
    parts.push(`Add-ons: ${order.selectedAddons.map((addon) => addon.label).join(', ')}`)
  }
  return parts.join(' | ')
}

const viewReceipt = async (order) => {
  selectedReceiptOrder.value = order
  receiptDialog.value = true

  if (order.receipt) return

  const receiptData = await fetchOrderReceipt(order.id)
  if (receiptData) {
    selectedReceiptOrder.value = {
      ...order,
      ...receiptData,
    }
  }
}

const isWithinReportDateRange = (dateString) => {
  if (!dateString) return true

  const orderTime = new Date(dateString).getTime()
  const startTime = reportStartDate.value ? new Date(`${reportStartDate.value}T00:00:00`).getTime() : null
  const endTime = reportEndDate.value ? new Date(`${reportEndDate.value}T23:59:59`).getTime() : null

  if (startTime && orderTime < startTime) return false
  if (endTime && orderTime > endTime) return false
  return true
}

const getFilteredOrdersForReport = () =>
  orders.value.filter((order) => {
    const matchesSeller = !reportSellerFilter.value || order.vendor === reportSellerFilter.value
    const matchesStatus = !reportStatusFilter.value || order.status === reportStatusFilter.value
    return matchesSeller && matchesStatus && isWithinReportDateRange(order.createdAt)
  })

const getFilteredProductsForReport = () =>
  sellerProducts.value.filter((product) => {
    if (!reportSellerFilter.value) return true
    return (product.vendor || product.seller) === reportSellerFilter.value
  })

const clearReportFilters = () => {
  reportSellerFilter.value = null
  reportStatusFilter.value = null
  reportStartDate.value = ''
  reportEndDate.value = ''
  generatedReport.value = null
}

const createMarketplaceSummaryReport = () => ({
  title: 'Marketplace Summary Report',
  columns: [
    { key: 'metric', label: 'Metric' },
    { key: 'value', label: 'Value' },
  ],
  rows: [
    { metric: 'Total Users', value: users.value.length },
    { metric: 'Buyers', value: users.value.filter((user) => user.role === 'buyer').length },
    { metric: 'Sellers', value: users.value.filter((user) => user.role === 'seller').length },
    { metric: 'Admins', value: users.value.filter((user) => user.role === 'admin').length },
    { metric: 'Seller Products', value: getFilteredProductsForReport().length },
    { metric: 'Active Products', value: getFilteredProductsForReport().filter((product) => product.active !== false).length },
    { metric: 'Filtered Orders', value: getFilteredOrdersForReport().length },
    {
      metric: 'Filtered Pending Payments',
      value: getFilteredOrdersForReport().filter((order) =>
        ['In Progress', 'Seller Confirmed', 'Item Sent'].includes(order.status),
      ).length,
    },
    {
      metric: 'Filtered Confirmed Sales',
      value: `RM ${getFilteredOrdersForReport()
        .reduce((sum, order) => (order.status === 'Completed' ? sum + Number(order.total || 0) : sum), 0)
        .toFixed(2)}`,
    },
  ],
})

const createUserReport = () => ({
  title: 'User Report',
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status' },
  ],
  rows: users.value.map((user) => ({
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '-',
    status: user.active === false ? 'Suspended' : 'Active',
  })),
})

const createProductReport = () => ({
  title: 'Product Report',
  columns: [
    { key: 'name', label: 'Product' },
    { key: 'seller', label: 'Seller' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Base Price' },
    { key: 'stock', label: 'Stock' },
    { key: 'variations', label: 'Variations' },
    { key: 'moderation', label: 'Moderation' },
    { key: 'status', label: 'Status' },
  ],
  rows: getFilteredProductsForReport().map((product) => ({
    name: product.name,
    seller: product.vendor || product.seller || '-',
    category: product.category || '-',
    price: `RM ${Number(product.price || 0).toFixed(2)}`,
    stock: product.stock ?? 'Not set',
    variations: product.variations?.length || 0,
    moderation: getModerationStatusLabel(product.moderationStatus),
    status: product.active === false ? 'Hidden' : 'Active',
  })),
})

const createOrderPaymentReport = () => ({
  title: 'Order & Payment Report',
  columns: [
    { key: 'orderId', label: 'Order ID' },
    { key: 'productName', label: 'Product' },
    { key: 'vendor', label: 'Seller' },
    { key: 'quantity', label: 'Qty' },
    { key: 'options', label: 'Options' },
    { key: 'total', label: 'Total' },
    { key: 'status', label: 'Status' },
    { key: 'receipt', label: 'Receipt' },
    { key: 'createdAt', label: 'Created At' },
  ],
  rows: getFilteredOrdersForReport().map((order) => ({
    orderId: order.id,
    productName: order.productName,
    vendor: order.vendor,
    quantity: order.quantity || 1,
    options: [
      order.selectedVariation ? `Variation: ${order.selectedVariation}` : '',
      order.selectedAddons?.length ? `Add-ons: ${order.selectedAddons.map((addon) => addon.label).join(', ')}` : '',
    ].filter(Boolean).join(' | ') || '-',
    total: `RM ${Number(order.total || 0).toFixed(2)}`,
    status: order.status,
    receipt: order.receiptFileName || (order.receipt ? 'Uploaded' : 'Not Uploaded'),
    createdAt: formatDateTime(order.createdAt),
  })),
})

const generateReport = () => {
  const reportFactories = {
    'marketplace-summary': createMarketplaceSummaryReport,
    'user-report': createUserReport,
    'product-report': createProductReport,
    'order-payment-report': createOrderPaymentReport,
  }

  const report = reportFactories[selectedReportType.value]?.()
  if (!report) return

  generatedReport.value = {
    ...report,
    generatedAt: formatDateTime(new Date().toISOString()),
  }

  $q.notify({
    color: 'primary',
    icon: 'summarize',
    message: `${generatedReport.value.title} generated.`,
    position: 'top',
  })
}

const escapeCsvValue = (value) => {
  const text = String(value ?? '')
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`

  return text
}

const exportReportCsv = () => {
  if (!generatedReport.value) return

  const header = generatedReport.value.columns.map((column) => escapeCsvValue(column.label)).join(',')
  const rows = generatedReport.value.rows.map((row) =>
    generatedReport.value.columns.map((column) => escapeCsvValue(row[column.key])).join(','),
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const filename = `${selectedReportType.value}-${new Date().toISOString().slice(0, 10)}.csv`

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  $q.notify({
    color: 'positive',
    icon: 'download',
    message: `${generatedReport.value.title} exported to CSV.`,
    position: 'top',
  })
}

const updateAdminOrderStatus = (orderId, status) => {
  orders.value = updateOrderStatus(orderId, status)
  $q.notify({
    color: status === 'Completed' ? 'positive' : status === 'Refunded' ? 'warning' : 'negative',
    icon: status === 'Completed' ? 'check_circle' : status === 'Refunded' ? 'undo' : 'cancel',
    message: `Order marked as ${status}.`,
    position: 'top',
  })
}

onMounted(() => {
  window.addEventListener('upnm-supabase-cache-updated', refreshAdminData)
})

onBeforeUnmount(() => {
  window.removeEventListener('upnm-supabase-cache-updated', refreshAdminData)
})
</script>
