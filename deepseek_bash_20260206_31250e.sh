# Create main project folder
mkdir veg-ecommerce
cd veg-ecommerce

# Create all required folders
mkdir -p backend/{models,controllers,routes,utils,locales/{en,hi,kn,mr}}
mkdir -p frontend/{src/components,src/pages,public}
mkdir -p admin-panel/src
mkdir -p {uploads,invoices,ssl}

echo "Project structure created!"