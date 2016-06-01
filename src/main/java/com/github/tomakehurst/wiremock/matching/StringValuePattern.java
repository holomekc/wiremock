package com.github.tomakehurst.wiremock.matching;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.google.common.base.Objects;
import com.google.common.base.Predicate;
import com.google.common.collect.FluentIterable;

import java.lang.reflect.Constructor;
import java.util.Collections;
import java.util.Map;

import static com.github.tomakehurst.wiremock.common.Exceptions.throwUnchecked;

@JsonDeserialize(using = StringValuePatternJsonDeserializer.class)
@JsonSerialize(include = JsonSerialize.Inclusion.NON_NULL)
public abstract class StringValuePattern implements ValueMatcher<String> {

    public static final StringValuePattern ABSENT = new StringValuePattern(null) {
        @Override
        public MatchResult match(String value) {
            return MatchResult.noMatch();
        }
    };

    protected final String expectedValue;

    public StringValuePattern(String expectedValue) {
        this.expectedValue = expectedValue;
    }

    public static StringValuePattern equalTo(String value) {
        return new EqualToPattern(value);
    }

    public static StringValuePattern equalToJson(String value) {
        return new EqualToJsonPattern(value, null, null);
    }

    public static StringValuePattern equalToJson(String value, boolean ignoreArrayOrder, boolean ignoreExtraElements) {
        return new EqualToJsonPattern(value, ignoreArrayOrder, ignoreExtraElements);
    }

    public static StringValuePattern matchesJsonPath(String value) {
        return new MatchesJsonPathPattern(value);
    }

    public static StringValuePattern equalToXml(String value) {
        return new EqualToXmlPattern(value);
    }

    public static StringValuePattern matchesXPath(String value) {
        return new MatchesXPathPattern(value, Collections.<String, String>emptyMap());
    }

    public static StringValuePattern matchesXPath(String value, Map<String, String> namespaces) {
        return new MatchesXPathPattern(value, namespaces);
    }

    public static StringValuePattern containing(String value) {
        return new ContainsPattern(value);
    }

    public static StringValuePattern matches(String regex) {
        return new RegexPattern(regex);
    }

    public static StringValuePattern doesNotMatch(String regex) {
        return new NegativeRegexPattern(regex);
    }

    public static StringValuePattern absent() {
        return ABSENT;
    }

    @JsonIgnore
    public boolean isPresent() {
        return this != ABSENT;
    }

    public Boolean isAbsent() {
        return this != ABSENT ? null : true;
    }

    @JsonIgnore
    public Boolean nullSafeIsAbsent() {
        return this == ABSENT;
    }

    @JsonIgnore
    public String getValue() {
        return expectedValue;
    }

    @Override
    public String toString() {
        return getName() + " " + getValue();
    }

    public final String getName() {
        Constructor<?> constructor =
            FluentIterable.of(this.getClass().getDeclaredConstructors()).firstMatch(new Predicate<Constructor<?>>() {
            @Override
            public boolean apply(Constructor<?> input) {
                return (input.getParameterAnnotations().length > 0 &&
                        input.getParameterAnnotations()[0].length > 0 &&
                        input.getParameterAnnotations()[0][0] instanceof JsonProperty);
            }
        }).orNull();

        if (constructor == null) {
            throw new IllegalStateException("Constructor must have a first parameter annotatated with JsonProperty(\"<operator name>\")");
        }
        JsonProperty jsonPropertyAnnotation = (JsonProperty) constructor.getParameterAnnotations()[0][0];
        return jsonPropertyAnnotation.value();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StringValuePattern that = (StringValuePattern) o;
        return Objects.equal(expectedValue, that.expectedValue);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(expectedValue);
    }
}
