build:
	docker-compose pull && docker-compose up -d

pkg :
	pkg petio.js --out-path "./bin"

clean:
	rm -rf node_modules && rm -rf admin/node_modules && rm -rf frontend/node_modules && rm -rf api/node_modules
	rm -rf admin/build && rm -rf frontend/build

docker-stop:
	docker-compose down