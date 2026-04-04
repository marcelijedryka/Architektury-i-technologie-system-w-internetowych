# Architektury-i-technologie-system-w-internetowych
Modern Digital Community Archive web application project. The platform is designed to empower local residents and history enthusiasts to collect, preserve, and share photographs that document the unique history and evolution of their region.

## 🚀 Tech Stack

### Frontend & Backend
* **React**: A component-based UI library for a seamless, interactive user experience.
* **Node.js**: A scalable runtime for the backend API, handling high-concurrency requests and metadata processing.

### Infrastructure & DevOps
* **AWS (Amazon Web Services)**: 
    * **S3**: For durable storage of high-resolution historical assets.
    * **CloudFront**: Global CDN for low-latency image delivery.
    * **Lambda/ECS**: Serverless or containerized compute for backend logic.
    * **RDS/DynamoDB**: Managed databases for archival metadata.
* **Terraform**: All infrastructure is managed as code (IaC), allowing for automated provisioning and environment consistency across Dev, Staging, and Production.

---