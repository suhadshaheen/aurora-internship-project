package com.aurora.info_hub.security;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockServletContext;
import org.springframework.web.context.support.GenericWebApplicationContext;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.handler.SimpleUrlHandlerMapping;
import org.springframework.web.servlet.resource.ResourceHttpRequestHandler;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class WebConfigTest {

    private ResourceHandlerRegistry buildRegistry() {
        GenericWebApplicationContext applicationContext = new GenericWebApplicationContext();
        MockServletContext servletContext = new MockServletContext();
        applicationContext.setServletContext(servletContext);
        applicationContext.refresh();

        return new ResourceHandlerRegistry(applicationContext, servletContext);
    }

    // ResourceHandlerRegistry#getHandlerMapping() is `protected`, and its
    // exact declared return type varies across Spring versions
    // (AbstractHandlerMapping vs AbstractUrlHandlerMapping), which makes a
    // subclass @Override approach version-fragile. Reflection sidesteps
    // both issues entirely: it doesn't care about the declared return type,
    // only about invoking the method and inspecting the actual runtime
    // object it returns (which is a SimpleUrlHandlerMapping either way).
    private SimpleUrlHandlerMapping invokeGetHandlerMapping(ResourceHandlerRegistry registry) throws Exception {
        Method method = ResourceHandlerRegistry.class.getDeclaredMethod("getHandlerMapping");
        method.setAccessible(true);
        return (SimpleUrlHandlerMapping) method.invoke(registry);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> registerAndGetUrlMap() throws Exception {
        WebConfig webConfig = new WebConfig();
        ResourceHandlerRegistry registry = buildRegistry();

        webConfig.addResourceHandlers(registry);

        SimpleUrlHandlerMapping handlerMapping = invokeGetHandlerMapping(registry);
        return (Map<String, Object>) handlerMapping.getUrlMap();
    }

    @Test
    void addResourceHandlers_shouldRegisterUploadsPathPattern() throws Exception {
        Map<String, Object> urlMap = registerAndGetUrlMap();

        assertThat(urlMap).containsKey("/uploads/**");
    }

    @Test
    void addResourceHandlers_shouldMapUploadsToAResourceHttpRequestHandler() throws Exception {
        Map<String, Object> urlMap = registerAndGetUrlMap();

        Object handler = urlMap.get("/uploads/**");

        assertThat(handler).isInstanceOf(ResourceHttpRequestHandler.class);
    }

    @Test
    void addResourceHandlers_shouldPointToTheUploadsFileLocation() throws Exception {
        Map<String, Object> urlMap = registerAndGetUrlMap();

        ResourceHttpRequestHandler handler = (ResourceHttpRequestHandler) urlMap.get("/uploads/**");
        List<Resource> locations = handler.getLocations();

        assertThat(locations).isNotEmpty();
        assertThat(locations)
                .anySatisfy(location -> assertThat(location.getDescription()).contains("uploads"));
    }

    @Test
    void addResourceHandlers_shouldOnlyRegisterOnePathPattern() throws Exception {
        Map<String, Object> urlMap = registerAndGetUrlMap();

        // Guards against accidentally registering extra/unexpected resource
        // handlers beyond the one intended mapping.
        assertThat(urlMap).hasSize(1);
    }
}