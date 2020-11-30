build:
	cd admin && npm install && npm run build
	cd frontend && npm install && npm run build
	cd api && npm install

docker:
	cd admin && npm install && npm run build
	cd frontend && npm install && npm run build
	docker build -t petio .
	cd api && docker build -t petio-api .
	docker-compose up -d

clean:
	rm -rf node_modules && rm -rf admin/node_modules && rm -rf frontend/node_modules && rm -rf api/node_modules
	rm -rf admin/build && rm -rf frontend/build

docker-stop:
	docker-compose down