build:
	docker-compose pull && docker-compose up -d

pkg :
	rm -rf ./bin && mkdir ./bin
	cd api && npm install
	npm install && pkg petio.js --out-path "./bin"
	mkdir ./bin/data
	# cd frontend && npm install && npm run build && mv build ../bin/data/fe
	# cd admin && npm install && npm run build && mv build ../bin/data/admin

clean:
	rm -rf node_modules && rm -rf admin/node_modules && rm -rf frontend/node_modules && rm -rf api/node_modules
	rm -rf admin/build && rm -rf frontend/build

docker-stop:
	docker-compose down