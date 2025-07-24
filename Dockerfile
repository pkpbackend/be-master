FROM node:20.10.0-alpine as build
WORKDIR /app
COPY . .
COPY yarn.stable.lock yarn.lock
RUN yarn install
RUN yarn build

FROM surnet/alpine-wkhtmltopdf:3.16.2-0.12.6-full as wkhtmltopdf

FROM node:20.10.0-alpine3.18
WORKDIR /app
COPY --from=build /app/dist dist
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/package.json .
COPY --from=build /app/views views
COPY --from=build /app/xlsx xlsx
COPY --from=build /app/src ./src
COPY --from=build /app/.sequelizerc .sequelizerc
COPY --from=build /app/tmp tmp
RUN chmod -R 777 /app/xlsx && chmod -R 777 /app/tmp 

# Install dependencies for wkhtmltopdf
RUN apk add --no-cache \
    libstdc++ \
    libx11 \
    libxrender \
    libxext \
    libssl1.1 \
    ca-certificates \
    fontconfig \
    freetype \
    ttf-dejavu \
    ttf-droid \
    ttf-freefont \
    ttf-liberation \
    # more fonts
    && apk add --no-cache --virtual .build-deps \
    msttcorefonts-installer \
    # Install microsoft fonts
    && update-ms-fonts \
    && fc-cache -f \
    # Clean up when done
    && rm -rf /tmp/* \
    && apk del .build-deps

COPY --from=wkhtmltopdf /bin/wkhtmltopdf /bin/wkhtmltopdf
COPY --from=wkhtmltopdf /bin/wkhtmltoimage /bin/wkhtmltoimage
COPY --from=wkhtmltopdf /bin/libwkhtmltox* /bin/

CMD ["yarn","start-docker"]
