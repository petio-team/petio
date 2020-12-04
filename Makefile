build:
	docker-compose build && docker-compose up -d

clean:
	rm -rf node_modules && rm -rf admin/node_modules && rm -rf frontend/node_modules && rm -rf api/node_modules
	rm -rf admin/build && rm -rf frontend/build

docker-stop:
	docker-compose down